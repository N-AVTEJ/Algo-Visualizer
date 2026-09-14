"""Thin wrapper around OpenAI Embeddings API.

Uses ``text-embedding-3-small`` (1536 dimensions) — a cost-effective model that
works well for short technical text.  The caller is responsible for handling the
case where ``OPENAI_API_KEY`` is None.
"""
from __future__ import annotations

import openai

from app.core.config import settings


def get_embedding(text: str) -> list[float]:
    """Return a 1536-dim embedding vector for *text*.

    Args:
        text: The text to embed.  Leading/trailing whitespace is stripped.

    Returns:
        A list of 1536 floats representing the embedding.

    Raises:
        openai.OpenAIError: If the API call fails for any reason.
        RuntimeError: If ``OPENAI_API_KEY`` is not configured.
    """
    if not settings.OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured. "
            "Add it to backend/.env to enable the AI assistant."
        )

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.embeddings.create(
        input=text.strip(),
        model=settings.OPENAI_EMBEDDING_MODEL,
    )
    return response.data[0].embedding
