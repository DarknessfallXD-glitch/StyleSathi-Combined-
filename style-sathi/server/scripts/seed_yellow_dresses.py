"""
Seed script: Add curated "Yellow Dress" products to Supabase for the demo,
with real images hosted on Cloudinary and embeddings computed with the same
deterministic embedder the /search endpoint uses (so searching "yellow dress"
actually retrieves them without an OPENAI_API_KEY).

Usage:
    python scripts/seed_yellow_dresses.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
from supabase import create_client
from services.storage import upload_image_bytes, download_image_bytes
from services.embeddings import DeterministicEmbeddingService
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_KEY)
embedder = DeterministicEmbeddingService()


# title -> (image source URL, description, category, price, currency, metadata)
YELLOW_DRESSES = {
    "Sunflower Yellow Summer Sundress": (
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600",
        "Bright sunflower yellow summer sundress. Lightweight cotton, perfect for warm Nepali days.",
        "Dress",
        1800.00,
        "NPR",
        {"brand": "Boho Nepal", "tags": ["yellow", "dress", "summer", "sundress"], "color": "yellow"},
    ),
    "Yellow Floral Maxi Dress": (
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600",
        "Elegant yellow floral maxi dress with flowy silhouette. Great for festivals and evenings.",
        "Dress",
        2600.00,
        "NPR",
        {"brand": "Boho Nepal", "tags": ["yellow", "floral", "dress", "maxi"], "color": "yellow"},
    ),
    "Golden Yellow Evening Gown": (
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
        "Stunning golden yellow evening gown. Rich fabric designed for formal occasions.",
        "Dress",
        5200.00,
        "NPR",
        {"brand": "Kathmandu Couture", "tags": ["yellow", "gown", "evening", "formal"], "color": "yellow"},
    ),
    "Mustard Yellow Wrap Dress": (
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
        "Fashionable mustard yellow wrap dress. Comfortable, stylish and easy to wear.",
        "Dress",
        2100.00,
        "NPR",
        {"brand": "Boho Nepal", "tags": ["yellow", "wrap", "dress", "mustard"], "color": "yellow"},
    ),
    "Lemon Yellow Party Dress": (
        "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600",
        "Bright lemon yellow party dress with a modern cut. Stand out at any celebration.",
        "Dress",
        3200.00,
        "NPR",
        {"brand": "Kathmandu Couture", "tags": ["yellow", "party", "dress", "lemon"], "color": "yellow"},
    ),
}


def build_product_text(record):
    title, (desc, category, price, currency, meta) = record[0], record[1]
    parts = [title, desc, category]
    tags = meta.get("tags") or []
    parts.extend(tags)
    return " ".join(parts)


def main():
    for title, (src, desc, category, price, currency, meta) in YELLOW_DRESSES.items():
        existing = supabase.table("products").select("id").eq("title", title).execute()
        if existing.data:
            logger.info(f"  - Skipping (exists): {title}")
            continue

        try:
            logger.info(f"  Downloading image for: {title}")
            image_bytes = download_image_bytes(src)
            slug = "".join(c for c in title.lower().replace(" ", "-") if c.isalnum() or c == "-")
            public_url = upload_image_bytes(image_bytes, folder=f"products/{slug}")

            text = build_product_text((title, (desc, category, price, currency, meta)))
            embedding = embedder.embed(text)

            row = {
                "title": title,
                "description": desc,
                "category": category,
                "price": price,
                "currency": currency,
                "image_url": public_url,
                "product_url": "",
                "source": "curated",
                "location": "NP",
                "embedding": embedding,
                "metadata": meta,
            }
            inserted = supabase.table("products").insert(row).execute()
            logger.info(f"    ✓ Inserted {title} | {public_url}")
        except Exception as e:
            logger.error(f"    ✗ Failed for {title}: {e}")

    logger.info("Done seeding yellow dress products.")


if __name__ == "__main__":
    main()
