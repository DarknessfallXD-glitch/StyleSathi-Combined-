from fastapi import APIRouter, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.search import process_search
from api.user import get_supabase, supabase as anon_supabase
from core.AppException import AppException

search_router = APIRouter()
security = HTTPBearer(auto_error=False)


def optional_auth(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    """Allow anonymous /search calls: authenticate only when a token is sent."""
    if credentials is None:
        return None
    try:
        user = anon_supabase.auth.get_user(credentials.credentials)
    except Exception:
        raise AppException("Invalid or expired token", 401)
    if not user or not user.user:
        raise AppException("Invalid token", 401)
    return {
        "sub": user.user.id,
        "email": user.user.email,
        "token": credentials.credentials,
    }


@search_router.get("/")
def search_products(
    query: str = Query(..., min_length=1, description="Search query"),
    location: str | None = Query(None, description="User location (NP, IN, US)"),
    category: str | None = Query(None, description="Product category filter"),
    limit: int = Query(20, ge=1, le=50, description="Max results"),
    info=Depends(optional_auth),
):
    if info and info.get("token"):
        supabase_client = get_supabase(info["token"])
        user_id = info["sub"]
    else:
        supabase_client = None
        user_id = None
    results = process_search(
        query=query,
        supabase_client=supabase_client,
        user_id=user_id,
        location=location,
        category=category,
        limit=limit,
    )
    return results
