from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from api.user import checkAuth
from services import storage
from core.AppException import AppException

images_router = APIRouter()


@images_router.post("/upload")
async def upload_image(
    file: UploadFile = File(..., description="Image file to store"),
    folder: str = Form("products", description="Storage sub-folder"),
    info=Depends(checkAuth),
):
    """Upload an image to the free cloud host (Cloudinary) and return its URL."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "file must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "file exceeds 10MB limit")

    try:
        url = storage.upload_image_bytes(image_bytes, folder=folder)
    except AppException as e:
        raise HTTPException(e.status_code, str(e.message))
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")

    return {"url": url}
