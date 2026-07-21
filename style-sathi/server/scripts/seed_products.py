"""
Seed script: Insert curated fashion products into Supabase.

Usage:
    python scripts/seed_products.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
from supabase import create_client, Client
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_KEY)

CURATED_PRODUCTS = [
    {
        "title": "Traditional Nepali Cotton Kurta",
        "description": "Handwoven cotton kurta with traditional Nepali patterns. Comfortable for daily wear.",
        "category": "Kurta",
        "price": 1500.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-kurta.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "Local Artisan", "tags": ["kurta", "cotton", "traditional"]},
    },
    {
        "title": "Pashmina Shawl - Pure Cashmere",
        "description": "Luxurious pure cashmere pashmina shawl handcrafted in the Himalayas.",
        "category": "Shawl",
        "price": 4500.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-pashmina.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "Himalayan Pashmina", "tags": ["pashmina", "cashmere", "shawl"]},
    },
    {
        "title": "Dhaka Topi (Nepali Cap)",
        "description": "Traditional Nepali Dhaka topi handwoven with authentic patterns.",
        "category": "Accessories",
        "price": 350.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-dhakatopi.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "Local Artisan", "tags": ["dhaka", "topi", "traditional"]},
    },
    {
        "title": "Hemp Yoga Pants",
        "description": "Eco-friendly hemp yoga pants made in Nepal. Sustainable and breathable.",
        "category": "Bottom",
        "price": 2200.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-hemp.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "EcoNepal", "tags": ["hemp", "yoga", "sustainable"]},
    },
    {
        "title": "Newari Gwa: Puja Dress",
        "description": "Traditional Newari gown for festivals and ceremonies. Rich red and gold embroidery.",
        "category": "Traditional",
        "price": 3800.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-newari.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "Newari Heritage", "tags": ["newari", "festival", "traditional"]},
    },
    {
        "title": "Cashmere Blend Sweater",
        "description": "Warm cashmere blend sweater perfect for Kathmandu winters.",
        "category": "Top",
        "price": 3200.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-sweater.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "Himalayan Knits", "tags": ["sweater", "cashmere", "winter"]},
    },
    {
        "title": "Mandala Print Maxi Dress",
        "description": "Beautiful mandala print maxi dress, flowy and comfortable for any occasion.",
        "category": "Dress",
        "price": 2800.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-maxi.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "Boho Nepal", "tags": ["mandala", "dress", "maxi"]},
    },
    {
        "title": "Handmade Beaded Necklace",
        "description": "Authentic Nepali handmade beaded necklace with semi-precious stones.",
        "category": "Jewelry",
        "price": 1200.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-necklace.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "Local Artisan", "tags": ["beaded", "necklace", "handmade"]},
    },
    {
        "title": "Organic Cotton T-Shirt",
        "description": "Organic cotton t-shirt with sustainable production. Available in multiple colors.",
        "category": "Top",
        "price": 900.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-tshirt.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "EcoNepal", "tags": ["organic", "cotton", "tshirt"]},
    },
    {
        "title": "Sari - Pure Silk Banarasi",
        "description": "Pure silk Banarasi sari with golden zari work. Imported from Varanasi.",
        "category": "Sari",
        "price": 8500.00,
        "currency": "NPR",
        "image_url": "/images/placeholder-sari.jpg",
        "source": "curated",
        "location": "NP",
        "metadata": {"brand": "Silk Heritage", "tags": ["silk", "banarasi", "sari"]},
    },
]


def main():
    existing = supabase.table("products").select("id, title").eq("source", "curated").execute()
    existing_titles = {p["title"] for p in existing.data}
    logger.info(f"Found {len(existing_titles)} existing curated products")

    new_count = 0
    for product in CURATED_PRODUCTS:
        if product["title"] in existing_titles:
            logger.info(f"  - Skipping (exists): {product['title']}")
            continue
        supabase.table("products").insert(product).execute()
        logger.info(f"  + Inserted: {product['title']}")
        new_count += 1

    logger.info(f"Done! Inserted {new_count} new products.")


if __name__ == "__main__":
    main()
