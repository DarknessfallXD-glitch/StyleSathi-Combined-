from supabase import Client

def get_preferences(client: Client, user_id: str):
    result = client.table("user_preferences").select("preferences").eq("user_id", user_id).execute()
    if not result.data:
        return {}  # return empty if not found
    return result.data[0]["preferences"]

def upsert_preferences(client: Client, user_id: str, preferences: dict):
    client.table("user_preferences").upsert({
        "user_id": user_id,
        "preferences": preferences,
        "updated_at": "now()"
    }).execute()