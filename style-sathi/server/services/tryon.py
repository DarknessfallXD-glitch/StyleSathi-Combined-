
import os
import io
import base64
import uuid
import logging
import tempfile
from pathlib import Path

import requests
from PIL import Image
from dotenv import load_dotenv
from gradio_client import Client, handle_file
from supabase import create_client, Client as SupabaseClient

from core.AppException import AppException

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
STORAGE_BUCKET = os.getenv("STORAGE_BUCKET", "tryon-images")

SPACE_ID = "WeShopAI/WeShopAI-Virtual-Try-On"
MAX_FILE_SIZE = 10 * 1024 * 1024

supabase: SupabaseClient = create_client(
    SUPABASE_PROJECT_URL,
    SUPABASE_SERVICE_KEY,
)


def check_usage_and_increment(
    supabase_client: SupabaseClient,
    user_id: str,
) -> dict:
    try:
        user = (
            supabase_client.table("users")
            .select(
                "subscription_status, free_tries_used, "
                "free_tries_limit, user_usage, daily_limit"
            )
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not user.data:
            raise AppException("User not found", 404)

        data = user.data
        is_subscribed = data.get("subscription_status") == "active"

        if is_subscribed:
            daily_limit = data.get("daily_limit", 20)
            user_usage = data.get("user_usage", 0)

            if user_usage >= daily_limit:
                raise AppException(
                    "Daily try-on limit reached. Upgrade or wait.",
                    429,
                )

            supabase_client.table("users").update({
                "user_usage": user_usage + 1
            }).eq("id", user_id).execute()

            return {"remaining": daily_limit - user_usage - 1}

        free_used = data.get("free_tries_used", 0)
        free_limit = data.get("free_tries_limit", 3)

        if free_used >= free_limit:
            raise AppException(
                "Free tries exhausted. Subscribe to continue.",
                402,
            )

        supabase_client.table("users").update({
            "free_tries_used": free_used + 1
        }).eq("id", user_id).execute()

        return {"remaining": free_limit - free_used - 1}

    except AppException:
        raise
    except Exception as error:
        raise AppException(
            f"Usage check failed: {str(error)}",
            500,
        )


def generate_with_weshopai(
    user_image_data: str,
    product_image_data: str,
) -> Image.Image:
    try:
        user_bytes = base64.b64decode(user_image_data)
        product_bytes = base64.b64decode(product_image_data)

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            person_path = temp_path / "person.png"
            garment_path = temp_path / "garment.png"

            # Normalize both inputs to PNG files.
            with Image.open(io.BytesIO(user_bytes)) as image:
                image.convert("RGB").save(person_path, format="PNG")

            with Image.open(io.BytesIO(product_bytes)) as image:
                image.convert("RGB").save(garment_path, format="PNG")

            client = Client(SPACE_ID)

            # IMPORTANT: WeShopAI expects garment first, person second.
            result = client.predict(
                handle_file(str(garment_path)),
                handle_file(str(person_path)),
                api_name="/generate_image",
            )

            # Handle common Gradio result formats.
            if isinstance(result, (list, tuple)):
                result = result[0] if result else None

            if isinstance(result, dict):
                result = (
                    result.get("path")
                    or result.get("image")
                    or result.get("url")
                )

            if not result:
                raise AppException(
                    "WeShopAI returned no generated image.",
                    502,
                )

            if isinstance(result, str) and result.startswith("http"):
                response = requests.get(result, timeout=90)
                response.raise_for_status()
                output_bytes = response.content
            else:
                result_path = Path(result)

                if not result_path.is_file():
                    raise AppException(
                        "Generated image file was not found.",
                        502,
                    )

                output_bytes = result_path.read_bytes()

            # Copy the image into memory before the temporary directory closes.
            with Image.open(io.BytesIO(output_bytes)) as image:
                return image.convert("RGB").copy()

    except AppException:
        raise
    except Exception as error:
        logger.exception("WeShopAI generation failed")
        raise AppException(
            f"WeShopAI image generation failed: {str(error)}",
            502,
        )



def upload_to_supabase_storage(
    image: Image.Image,
    user_id: str,
) -> str:
    try:
        file_name = f"{user_id}/{uuid.uuid4().hex}.png"

        # Create a temporary directory for the PNG file.
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as temp_dir:
            image_path = Path(temp_dir) / "generated_image.png"

            # Save the generated image to disk.
            image.save(image_path, format="PNG")

            # Upload using the file path.
            supabase.storage.from_(STORAGE_BUCKET).upload(
                path=file_name,
                file=str(image_path),
                file_options={"content-type": "image/png"},
            )

        # Return the public URL.
        return supabase.storage.from_(STORAGE_BUCKET).get_public_url(
            file_name
        )

    except Exception as error:
        logger.exception("Supabase image upload failed")
        raise AppException(
            f"Failed to upload image: {str(error)}",
            500,
        )



def generate_try_on(
    user_image_data: str,
    product_image_data: str,
    user_id: str,
    supabase_client: SupabaseClient,
    prompt: str | None = None,
) -> dict:

    # Preserve the existing subscription and free-try system.
    usage = check_usage_and_increment(supabase_client, user_id)

    try:
        result_image = generate_with_weshopai(
            user_image_data=user_image_data,
            product_image_data=product_image_data,
        )

        image_url = upload_to_supabase_storage(
            result_image,
            user_id,
        )

    except AppException:
        raise
    except Exception as error:
        logger.exception("Try-on failed for user %s", user_id)
        raise AppException(
            f"Image generation failed: {str(error)}",
            502,
        )

    # Preserve the existing try-on history.
    try:
        supabase_client.table("tryon_history").insert({
            "user_id": user_id,
            "result_url": image_url,
        }).execute()

    except Exception as error:
        logger.warning(
            "Failed to save try-on history: %s",
            error,
        )

    # Preserve the response expected by the frontend.
    return {
        "generated_image_url": image_url,
        "usage_remaining": usage["remaining"],
    }
