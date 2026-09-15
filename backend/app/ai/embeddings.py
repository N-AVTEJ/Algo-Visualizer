"""Wrapper around Google Gemini / OpenAI Embeddings API.

Uses ``text-embedding-004`` (768 dimensions) via official ``google-genai`` SDK.
The caller is responsible for handling the case where ``GEMINI_API_KEY`` is None.
"""
from __future__ import annotations

from app.core.config import settings


def get_embedding(text: str) -> list[float]:
    """Return an embedding vector for *text*.

    Args:
        text: The text to embed.  Leading/trailing whitespace is stripped.

    Returns:
        A list of floats representing the embedding (768-dim for text-embedding-004).

    Raises:
        RuntimeError: If neither GEMINI_API_KEY nor OPENAI_API_KEY is configured.
        Exception: If the API call fails for any reason.
    """
    if settings.GEMINI_API_KEY:
        from google import genai

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        models_to_try = [
            settings.GEMINI_EMBEDDING_MODEL,
            "gemini-embedding-001",
            "gemini-embedding-2",
        ]
        seen = set()
        unique_models = [m for m in models_to_try if not (m in seen or seen.add(m))]

        last_err = None
        for mod in unique_models:
            try:
                response = client.models.embed_content(
                    model=mod,
                    contents=text.strip(),
                )
                return list(response.embeddings[0].values)
            except Exception as e:
                last_err = e
                continue

        if last_err:
            raise last_err

    if settings.OPENAI_API_KEY:
        import openai

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.embeddings.create(
            input=text.strip(),
            model=settings.OPENAI_EMBEDDING_MODEL,
        )
        return response.data[0].embedding

    raise RuntimeError(
        "GEMINI_API_KEY is not configured. "
        "Add it to backend/.env to enable the AI assistant."
    )
