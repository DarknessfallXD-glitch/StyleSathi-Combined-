from dotenv import load_dotenv
import os
from core.AppException import AppException

load_dotenv()

def get_voice_service():
    mode = os.getenv("VOICE_SERVICE_TYPE")

    if mode == "local":
        from services.voice_local import LocalWhisperService
        return LocalWhisperService()

    elif mode == "cloud":
        from services.voice_cloud import CloudVoiceService
        return CloudVoiceService()

    else:
        raise AppException("Invalid Mode of Voice Service")