from dotenv import load_dotenv
from services.embeddings import get_embedding_service, BaseEmbeddingService
from services.products import search_products as vector_search
from services.affiliate import search_affiliate_all
from services.users import getUser
from core.AppException import AppException
import re
import logging
import numpy as np

load_dotenv()

logger = logging.getLogger(__name__)


LOCATION_MAP = {
    "NP": "Nepal",
    "IN": "India",
    "US": "United States",
    "UK": "United Kingdom",
    "AE": "UAE",
}

AFFILIATE_LOCATIONS = {
    "NP": "NP",
    "IN": "IN",
    "US": "US",
    "UK": "UK",
    "AE": "AE",
}


def detect_location_from_user(supabase_client, user_id: str) -> str:
    try:
        user = getUser(supabase_client, user_id)
        prefs = user.get("language_preference", "") or ""
        if "ne" in prefs or "np" in prefs:
            return "NP"
        if "hi" in prefs or "in" in prefs:
            return "IN"
        if "en" in prefs:
            return "US"
        return "NP"
    except Exception:
        return "NP"


def extract_keywords(query: str) -> list[str]:
    stopwords = {
        "a", "an", "the", "is", "are", "was", "were", "be", "been",
        "being", "have", "has", "had", "do", "does", "did", "will",
        "would", "can", "could", "shall", "should", "may", "might",
        "i", "you", "he", "she", "it", "we", "they", "me", "him",
        "her", "us", "them", "my", "your", "his", "its", "our",
        "their", "this", "that", "these", "those", "in", "on", "at",
        "for", "to", "of", "with", "by", "from", "up", "about",
        "into", "over", "after", "find", "show", "get", "want",
        "need", "looking", "search", "please", "help", "tell",
        "suggest", "recommend", "clothes", "dress", "wear",
    }

    query = query.lower().strip()
    query = re.sub(r"[^\w\s]", " ", query)
    words = query.split()
    keywords = [w for w in words if w not in stopwords and len(w) > 1]

    if not keywords:
        return [query.strip()]

    return keywords[:8]


def build_product_text(product: dict) -> str:
    parts = [product.get("title", "")]
    desc = product.get("description", "")
    if desc:
        parts.append(desc)
    meta = product.get("metadata", {}) or {}
    if meta.get("category"):
        parts.append(meta["category"])
    if meta.get("brand"):
        parts.append(meta["brand"])
    return " ".join(parts)


def cosine_similarity(a: list[float], b: list[float]) -> float:
    a_arr = np.array(a, dtype=np.float32)
    b_arr = np.array(b, dtype=np.float32)
    if np.linalg.norm(a_arr) == 0 or np.linalg.norm(b_arr) == 0:
        return 0.0
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))


def rank_by_similarity(
    products: list[dict],
    query_embedding: list[float],
    embedder: BaseEmbeddingService,
    top_k: int = 20,
) -> list[dict]:
    if not products:
        return []

    texts = [build_product_text(p) for p in products]
    product_embeddings = embedder.embed_batch(texts)

    scored = []
    for product, emb in zip(products, product_embeddings):
        score = cosine_similarity(query_embedding, emb)
        scored.append((score, product))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [{"score": round(s, 4), **p} for s, p in scored[:top_k]]


def process_search(
    query: str,
    supabase_client,
    user_id: str | None = None,
    location: str | None = None,
    category: str | None = None,
    limit: int = 20,
) -> dict:
    if not query or not query.strip():
        raise AppException("Query is required", 400)

    query = query.strip()
    print(f"🔎 SEARCH CALLED: query={query}, category={category}")
    if not location:
        if user_id:
            location = detect_location_from_user(supabase_client, user_id)
        else:
            location = "NP"

    embedder = get_embedding_service()
    query_embedding = embedder.embed(query)

    keywords = extract_keywords(query)
    keyword_str = " ".join(keywords)

    print(f"📍 LOCATION: {location}")
    print(f"📦 CATEGORY: {category}")

    vector_results = []
    if location == "NP":
        print("🔍 Starting vector search...")
        try:
            vector_results = vector_search(
            
                query_embedding=query_embedding,
                limit=limit,
                location=location,
                category=category,
            )
            print(f"🔍 VECTOR SEARCH: {len(vector_results)} products found")
        except Exception as e:
             print(f"❌ VECTOR SEARCH ERROR: {e}")

    print(f"🧩 CATEGORY FILTER: {category}")

    # ---------- FALLBACK: if vector search returned nothing ----------
    if not vector_results:
        logger.info("Vector search returned no results; falling back to random products.")
        fallback = supabase_client.table("products").select("*").limit(limit).execute()
        vector_results = fallback.data
        for item in vector_results:
            item["score"] = 0.5          # neutral score
            item["source_db"] = "fallback"

    affiliate_results = search_affiliate_all(keyword_str, location, limit)

    all_results = []

    for vr in vector_results:
        vr["source_db"] = "curated"
        if "score" not in vr:
            vr["score"] = vr.pop("similarity", 0.5) if "similarity" in vr else 0.5
        all_results.append(vr)

    if affiliate_results:
        ranked_affiliate = rank_by_similarity(
            affiliate_results, query_embedding, embedder, top_k=limit
        )
        all_results.extend(ranked_affiliate)

    

    all_results.sort(key=lambda x: x.get("score", 0), reverse=True)
    top_results = all_results[:3]
    more_results = all_results[3:]

    return {
        "query": query,
        "keywords": keywords,
        "location": location,
        "total_results": len(all_results),
        "top_results": top_results,
        "more_results": more_results,
    }