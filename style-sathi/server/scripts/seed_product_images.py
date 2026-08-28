"""
Seed script: Download real product images and store them on a free cloud
image host (Cloudinary), then update the curated products' image_url.

This is for the TEMP demo database. Images are pushed to the free
Cloudinary host so URLs are public and servable from anywhere.

Usage:
    python scripts/seed_product_images.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
from supabase import create_client, Client
from services.storage import upload_image_bytes, download_image_bytes
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_KEY)

# Map curated product title -> a stable image source URL.
# These are Unsplash photo URLs (safe, live, no API key needed).
PRODUCT_IMAGE_SOURCES = {
    "Traditional Nepali Cotton Kurta": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
    "Pashmina Shawl - Pure Cashmere": "https://images.unsplash.com/photo-1603974372036-0a195ccf57ed?w=600",
    "Dhaka Topi (Nepali Cap)": "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=600",
    "Hemp Yoga Pants": "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600",
    "Newari Gwa: Puja Dress": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
    "Cashmere Blend Sweater": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600",
    "Mandala Print Maxi Dress": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600",
    "Handmade Beaded Necklace": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
    "Organic Cotton T-Shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    "Sari - Pure Silk Banarasi": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
}


def main():
    result = supabase.table("products").select("id, title, image_url").eq("source", "curated").execute()
    products = result.data
    logger.info(f"Found {len(products)} curated products")

    updated = 0
    failed = 0

    for product in products:
        title = product.get("title", "")
        source_url = PRODUCT_IMAGE_SOURCES.get(title)

        if not source_url:
            logger.warning(f"  - No image source mapped: {title}")
            continue

        slug = title.lower().replace(" ", "-").replace(":", "").replace(",", "")
        slug = "".join(c for c in slug if c.isalnum() or c == "-")

        try:
            logger.info(f"  Downloading image for: {title}")
            image_bytes = download_image_bytes(source_url)
            public_url = upload_image_bytes(image_bytes, folder=f"products/{slug}")
            supabase.table("products").update({"image_url": public_url}).eq("id", product["id"]).execute()
            logger.info(f"    ✓ {public_url}")
            updated += 1
        except Exception as e:
            logger.error(f"    ✗ Failed for {title}: {e}")
            failed += 1

    logger.info(f"Done! Published {updated} product images, failed {failed}.")


if __name__ == "__main__":
    main()
