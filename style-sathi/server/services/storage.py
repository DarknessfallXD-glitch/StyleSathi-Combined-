from dotenv import load_dotenv
import io
import os
import uuid
import logging
import requests
from PIL import Image
from core.AppException import AppException

load_dotenv()

logger = logging.getLogger(__name__)

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
CLOUDINARY_FOLDER = os.getenv("CLOUDINARY_FOLDER", "stylesathi")


def has_cloudinary_config() -> bool:
    return bool(CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET)


def _get_image_format(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        fmt = (image.format or "JPEG").lower()
        return "jpg" if fmt == "jpeg" else fmt
    except Exception:
        return "jpg"


def upload_image_bytes(
    image_bytes: bytes,
    folder: str = "products",
    public_id: str | None = None,
) -> str:
    """Upload raw image bytes to Cloudinary (free cloud host) and return the URL."""
    if not has_cloudinary_config():
        raise AppException(
            "Cloudinary not configured (set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)",
            500,
        )

    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )

    public_id = public_id or f"{folder}/{uuid.uuid4().hex}"

    try:
        result = cloudinary.uploader.upload(
            image_bytes,
            public_id=f"{CLOUDINARY_FOLDER}/{public_id}",
            folder="",
            resource_type="image",
            overwrite=True,
        )
        return result.get("secure_url") or result.get("url")
    except Exception as e:
        raise AppException(f"Cloudinary upload failed: {str(e)}", 500)


def upload_pil_image(image: Image.Image, folder: str = "products") -> str:
    """Upload a PIL image to Cloudinary and return the URL."""
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return upload_image_bytes(buffer.getvalue(), folder=folder)


def download_image_bytes(image_url: str, timeout: int = 30) -> bytes:
    """Download an image from an external URL and return raw bytes."""
    try:
        response = requests.get(image_url, timeout=timeout)
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "") or ""
        if not content_type.startswith("image/"):
            raise AppException(f"URL is not an image: {image_url}", 400)
        return response.content
    except AppException:
        raise
    except Exception as e:
        raise AppException(f"Failed to download image '{image_url}': {str(e)}", 400)
