from services.baseVoice import BaseVoiceService
from openai import OpenAI
import io
import os


class CloudVoiceService(BaseVoiceService):

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def transcribe(self, audio_bytes):

        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "audio.mp3"
        transcribed = self.client.audio.transcriptions.create(
            model="gpt-4o-transcribe",
            file=audio_file
        )

        return transcribed.text

  