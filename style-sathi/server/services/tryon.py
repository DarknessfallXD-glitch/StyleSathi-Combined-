from dotenv import load_dotenv
import os
import io
import base64
import uuid
import logging
import requests
from PIL import Image
from supabase import create_client, Client
from services.baseFlux import BaseFluxService
from services.flux_local import ColabFluxService
from core.AppException import AppException

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
COLAB_FLUX_URL = os.getenv("COLAB_FLUX_URL")
STORAGE_BUCKET = os.getenv("STORAGE_BUCKET", "tryon-images")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_KEY)


def image_to_base64(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def base64_to_image(b64_str: str) -> Image.Image:
    image_bytes = base64.b64decode(b64_str)
    return Image.open(io.BytesIO(image_bytes))


def encode_image_from_url(image_url: str) -> str:
    response = requests.get(image_url, timeout=30)
    response.raise_for_status()
    return base64.b64encode(response.content).decode("utf-8")


def get_flux_service() -> BaseFluxService:
    if REPLICATE_API_TOKEN:
        return ReplicateFluxService()
    if COLAB_FLUX_URL:
        return ColabFluxService(COLAB_FLUX_URL)
    raise AppException("No FLUX service configured (set REPLICATE_API_TOKEN or COLAB_FLUX_URL)", 500)


class ReplicateFluxService(BaseFluxService):
    def __init__(self):
        self.api_token = REPLICATE_API_TOKEN

    def generate(self, task):
        import replicate

        client = replicate.Client(api_token=self.api_token)

        user_image_b64 = encode_image_from_url(task.image) if task.image.startswith("http") else task.image
        product_image_b64 = encode_image_from_url(task.mask) if task.mask.startswith("http") else task.mask

        output = client.run(
            "black-forest-labs/flux-dev-fill-pro",
            input={
                "image": f"data:image/png;base64,{user_image_b64}",
                "mask": f"data:image/png;base64,{product_image_b64}",
                "prompt": task.prompt or "A person wearing this clothing item naturally",
                "num_inference_steps": 28,
                "guidance_scale": 3.5,
            },
        )

        if isinstance(output, list) and len(output) > 0:
            image_url = output[0]
        elif isinstance(output, str):
            image_url = output
        else:
            raise AppException("No output from FLUX model", 500)

        response = requests.get(image_url, timeout=60)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content))


def upload_to_supabase_storage(image: Image.Image, user_id: str) -> str:
    try:
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        file_name = f"{user_id}/{uuid.uuid4().hex}.png"

        supabase.storage.from_(STORAGE_BUCKET).upload(
            path=file_name,
            file=buffer,
            file_options={"content-type": "image/png"},
        )

        public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(file_name)
        return public_url
    except Exception as e:
        raise AppException(f"Failed to upload image: {str(e)}", 500)


def check_usage_and_increment(supabase_client: Client, user_id: str) -> dict:
    try:
        user = supabase_client.table("users").select(
            "subscription_status, free_tries_used, free_tries_limit, user_usage, daily_limit"
        ).eq("id", user_id).single().execute()

        if not user.data:
            raise AppException("User not found", 404)

        u = user.data
        is_subscribed = u.get("subscription_status") == "active"

        if is_subscribed:
            daily_limit = u.get("daily_limit", 20)
            user_usage = u.get("user_usage", 0)
            if user_usage >= daily_limit:
                raise AppException("Daily try-on limit reached. Upgrade or wait.", 429)
            supabase_client.table("users").update({
                "user_usage": user_usage + 1
            }).eq("id", user_id).execute()
            return {"remaining": daily_limit - user_usage - 1}
        else:
            free_used = u.get("free_tries_used", 0)
            free_limit = u.get("free_tries_limit", 3)
            if free_used >= free_limit:
                raise AppException(
                    "Free tries exhausted. Subscribe to continue.", 402
                )
            supabase_client.table("users").update({
                "free_tries_used": free_used + 1
            }).eq("id", user_id).execute()
            return {"remaining": free_limit - free_used - 1}
    except AppException:
        raise
    except Exception as e:
        raise AppException(f"Usage check failed: {str(e)}", 500)


def generate_try_on(
    user_image_data: str,
    product_image_data: str,
    user_id: str,
    supabase_client: Client,
    prompt: str | None = None,
) -> dict:
    usage = check_usage_and_increment(supabase_client, user_id)

    from schemas.taskBody import GenerationTask

    task = GenerationTask(
        image=user_image_data,
        mask=product_image_data,
        prompt=prompt or "A person wearing this clothing item naturally, photorealistic, high quality",
    )

    service = get_flux_service()
    try:
        result_image = service.generate(task)
    except Exception as e:
        logger.error(f"FLUX generation failed for user {user_id}: {str(e)}")
        raise AppException(f"Image generation failed: {str(e)}", 500)

    image_url = upload_to_supabase_storage(result_image, user_id)

    try:
        supabase_client.table("tryon_history").insert({
            "user_id": user_id,
            "result_url": image_url,
            "created_at": "now()",
        }).execute()
    except Exception as e:
        logger.warning(f"Failed to save try-on history: {str(e)}")

    return {
        "generated_image_url": image_url,
        "usage_remaining": usage["remaining"],
    }
