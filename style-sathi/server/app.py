from fastapi import FastAPI
from api.preferences import preferences_router
from fastapi.middleware.cors import CORSMiddleware
from core.handlers import register_exception_handler
from api.user import user_router
from api.audio import audio_router
from api.subscription import subscription_router
from api.search import search_router
from api.tryon import tryon_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handler(app)

app.include_router(user_router, prefix="/user")
app.include_router(audio_router, prefix="/audio")
app.include_router(subscription_router, prefix="/subscription")
app.include_router(preferences_router, prefix="/preferences")
app.include_router(search_router, prefix="/search")
app.include_router(tryon_router, prefix="/try-on")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
