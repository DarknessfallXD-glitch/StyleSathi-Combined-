# item threshold can be changed here

from dotenv import load_dotenv
from supabase import create_client, Client
from services.embeddings import get_embedding_service, BaseEmbeddingService
from core.AppException import AppException
import os

load_dotenv()

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_KEY)


def get_embedder() -> BaseEmbeddingService:
    return get_embedding_service()


def search_products(
    query_embedding: list[float],
    limit: int = 20,
    location: str = "NP",
    category: str | None = None
) -> list[dict]:
    try:
        # ivfflat is approximate: it only visits a subset of index lists, so it
        # can miss nearby vectors unless we request far more candidates than we
        # finally return. Ask for a larger pool, then trim back to `limit`.
        probe_count = max(int(limit) * 5, 200)
        rpc_params = {
            "query_embedding": query_embedding,
            "match_threshold": 0.4, # lower = more lenient matching (demo-friendly)
            "match_count": probe_count,
            "filter_location": location,
        }
        if category:
            rpc_params["filter_category"] = category

        result = supabase.rpc("match_products", rpc_params).execute()
        return result.data[:limit]
    except Exception as e:
        raise AppException(f"Vector search failed: {str(e)}", 500)


def get_product_by_id(product_id: str) -> dict:
    try:
        result = supabase.table("products").select("*").eq("id", product_id).single().execute()
        return result.data
    except Exception:
        raise AppException("Product not found", 404)


def upsert_product(product: dict) -> dict:
    try:
        result = supabase.table("products").upsert(product).execute()
        return result.data[0]
    except Exception as e:
        raise AppException(f"Failed to save product: {str(e)}", 500)


def upsert_products_batch(products: list[dict]) -> list[dict]:
    if not products:
        return []
    try:
        result = supabase.table("products").upsert(products, ignore_duplicates=True).execute()
        return result.data
    except Exception as e:
        raise AppException(f"Batch upsert failed: {str(e)}", 500)


def generate_and_store_embedding(product_id: str, text: str):
    embedder = get_embedder()
    embedding = embedder.embed(text)
    try:
        supabase.table("products").update({
            "embedding": embedding
        }).eq("id", product_id).execute()
    except Exception as e:
        raise AppException(f"Failed to store embedding: {str(e)}", 500)
