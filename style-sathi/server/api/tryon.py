from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from api.user import checkAuth, get_supabase
from services.tryon import generate_try_on
from core.AppException import AppException
import base64

tryon_router = APIRouter()


@tryon_router.post("/generate")
async def generate_tryon(
    user_image: UploadFile = File(..., description="Photo of the user"),
    product_image: UploadFile = File(..., description="Product clothing image"),
    prompt: str | None = Form(None, description="Optional custom prompt for FLUX"),
    info=Depends(checkAuth),
):
    if not user_image.content_type or not user_image.content_type.startswith("image/"):
        raise HTTPException(400, "user_image must be an image file")
    if not product_image.content_type or not product_image.content_type.startswith("image/"):
        raise HTTPException(400, "product_image must be an image file")

    user_image_bytes = await user_image.read()
    product_image_bytes = await product_image.read()

    if len(user_image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "user_image exceeds 10MB limit")
    if len(product_image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "product_image exceeds 10MB limit")

    user_image_b64 = base64.b64encode(user_image_bytes).decode("utf-8")
    product_image_b64 = base64.b64encode(product_image_bytes).decode("utf-8")

    supabase_client = get_supabase(info["token"])

    result = generate_try_on(
        user_image_data=user_image_b64,
        product_image_data=product_image_b64,
        user_id=info["sub"],
        supabase_client=supabase_client,
        prompt=prompt,
    )

    return result
