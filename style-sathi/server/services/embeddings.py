from abc import ABC, abstractmethod
from dotenv import load_dotenv
import os
import numpy as np

load_dotenv()


class BaseEmbeddingService(ABC):
    @abstractmethod
    def embed(self, text: str) -> list[float]:
        pass

    @abstractmethod
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        pass


class OpenAIEmbeddingService(BaseEmbeddingService):
    def __init__(self):
        from openai import OpenAI
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        self.dimension = int(os.getenv("EMBEDDING_DIMENSION", "1024"))

    def embed(self, text: str) -> list[float]:
        response = self.client.embeddings.create(
            model=self.model,
            input=text,
            dimensions=self.dimension
        )
        return response.data[0].embedding

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        response = self.client.embeddings.create(
            model=self.model,
            input=texts,
            dimensions=self.dimension
        )
        response = sorted(response.data, key=lambda x: x.index)
        return [item.embedding for item in response]


class LocalBGE3EmbeddingService(BaseEmbeddingService):
    def __init__(self):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer(
            "BAAI/bge-m3",
            device="cpu",
            truncate_dim=1024
        )

    def embed(self, text: str) -> list[float]:
        emb = self.model.encode(text, normalize_embeddings=True)
        return emb.tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        embs = self.model.encode(texts, normalize_embeddings=True)
        return [e.tolist() for e in embs]


def get_embedding_service() -> BaseEmbeddingService:
    provider = os.getenv("EMBEDDING_PROVIDER", "openai")
    if provider == "local":
        return LocalBGE3EmbeddingService()
    return OpenAIEmbeddingService()
