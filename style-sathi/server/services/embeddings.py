from abc import ABC, abstractmethod
from dotenv import load_dotenv
import os
import numpy as np
import logging

load_dotenv()

logger = logging.getLogger(__name__)


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


class DeterministicEmbeddingService(BaseEmbeddingService):
    """Deterministic, dependency-free fallback used when no embedding
    provider is configured. Produces 1024-dim hashed feature vectors so
    /search still works without an OPENAI_API_KEY."""

    DIM = 1024

    def _vector(self, text: str) -> list[float]:
        import hashlib
        vec = [0.0] * self.DIM
        lowered = (text or " ").lower()
        tokens = lowered.replace("-", " ").replace("_", " ").split()
        for token in tokens:
            digest = hashlib.sha256(token.encode()).digest()
            index = int.from_bytes(digest[:4], "big") % self.DIM
            sign = 1.0 if digest[4] % 2 else -1.0
            vec[index] += sign * (1.0 + float(int.from_bytes(digest[5:8], "big") % 100) / 100.0)
        norm = sum(v * v for v in vec) ** 0.5
        if norm:
            vec = [v / norm for v in vec]
        return vec

    def embed(self, text: str) -> list[float]:
        return self._vector(text)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return [self._vector(t) for t in texts]


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
    if provider == "openai" and not os.getenv("OPENAI_API_KEY"):
        logger.warning("OPENAI_API_KEY not set; using deterministic fallback embedder")
        return DeterministicEmbeddingService()
    return OpenAIEmbeddingService()
