from fastapi import APIRouter, Depends, Query
from services.search import process_search
from api.user import checkAuth, get_supabase

search_router = APIRouter()


@search_router.get("/")
def search_products(
    query: str = Query(..., min_length=1, description="Search query"),
    location: str | None = Query(None, description="User location (NP, IN, US)"),
    category: str | None = Query(None, description="Product category filter"),
    limit: int = Query(20, ge=1, le=50, description="Max results"),
    info=Depends(checkAuth),
):
    supabase_client = get_supabase(info["token"])
    results = process_search(
        query=query,
        supabase_client=supabase_client,
        user_id=info["sub"],            
        location=location,
        category=category,
        limit=limit,
    )
    return results
