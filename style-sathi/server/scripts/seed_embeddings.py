"""
Seed script: Generate BGE-M3 / OpenAI embeddings for all curated products
in Supabase that don't already have embeddings.

Usage:
    python scripts/seed_embeddings.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
from supabase import create_client, Client
from services.embeddings import get_embedding_service
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_KEY)


def build_product_text(product: dict) -> str:
    parts = [
        product.get("title", ""),
        product.get("description", ""),
        product.get("category", ""),
    ]
    meta = product.get("metadata") or {}
    if isinstance(meta, dict):
        if meta.get("brand"):
            parts.append(meta["brand"])
        tags = meta.get("tags") or []
        if isinstance(tags, list):
            parts.extend(tags)
    return " ".join(p for p in parts if p)


def main():
    embedder = get_embedding_service()
    logger.info(f"Using embedder: {type(embedder).__name__}")

    result = supabase.table("products").select("id, title, description, category, metadata").is_("embedding", "null").execute()
    products = result.data
    logger.info(f"Found {len(products)} products without embeddings")

    if not products:
        return

    texts = [build_product_text(p) for p in products]
    embeddings = embedder.embed_batch(texts)

    for product, emb in zip(products, embeddings):
        supabase.table("products").update({"embedding": emb}).eq("id", product["id"]).execute()
        logger.info(f"  ✓ {product['title'][:50]}")

    logger.info(f"Done! Seeded {len(products)} embeddings.")


if __name__ == "__main__":
    main()
