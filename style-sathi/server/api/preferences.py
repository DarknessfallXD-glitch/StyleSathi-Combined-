from fastapi import APIRouter, Depends, Body
from core.AppException import AppException
from services.preferences import get_preferences, upsert_preferences
from api.user import checkAuth
from supabase import create_client
import os

preferences_router = APIRouter()

def get_supabase(token: str):
    client = create_client(os.getenv("SUPABASE_PROJECT_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    client.postgrest.auth(token)
    return client

@preferences_router.get("/me")
def get_my_preferences(info=Depends(checkAuth)):
    client = get_supabase(info["token"])
    prefs = get_preferences(client, info["sub"])
    return {"preferences": prefs}

@preferences_router.patch("/me")
def update_my_preferences(prefs: dict = Body(...), info=Depends(checkAuth)):
    client = get_supabase(info["token"])
    upsert_preferences(client, info["sub"], prefs)
    return {"success": True}