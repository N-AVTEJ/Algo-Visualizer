"""RAG (Retrieval-Augmented Generation) pipeline for Google Gemini & OpenAI.

Responsibilities:
1. ``retrieve_context`` — cosine similarity search (via pgvector raw SQL or JSON embedding fallback).
2. ``build_prompt``     — assemble chat messages with curriculum context.
3. ``chat_completion``  — call Gemini (or OpenAI) and return the answer string.
"""
from __future__ import annotations

import json
import math
from typing import TYPE_CHECKING

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings

if TYPE_CHECKING:
    pass


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

def _cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Calculate cosine similarity between two float vectors."""
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    return dot / (norm1 * norm2) if (norm1 and norm2) else 0.0


def retrieve_context(
    query_embedding: list[float],
    db: Session,
    top_k: int = 5,
) -> list[dict]:
    """Retrieve the top-*k* most relevant knowledge-base chunks.

    First attempts pgvector ``<=>`` cosine-distance operator via raw SQL.
    If the vector extension is not available (e.g. SQLite, Windows Postgres without pgvector),
    falls back to in-memory cosine ranking using the stored ``embedding_json`` column.

    Args:
        query_embedding: Float vector from :func:`~app.ai.embeddings.get_embedding`.
        db: Active SQLAlchemy session.
        top_k: Number of chunks to retrieve.

    Returns:
        List of dicts with keys ``topic`` and ``content``.
    """
    # 1. Try pgvector raw SQL if vector extension is active
    try:
        vec_literal = "[" + ",".join(str(v) for v in query_embedding) + "]"
        sql = text(
            """
            SELECT topic, content
            FROM   knowledge_base
            ORDER  BY embedding <=> CAST(:vec AS vector)
            LIMIT  :k
            """
        )
        rows = db.execute(sql, {"vec": vec_literal, "k": top_k}).fetchall()
        return [{"topic": row.topic, "content": row.content} for row in rows]
    except Exception:
        pass

    # 2. Fallback: in-memory cosine similarity via embedding_json
    try:
        sql = text("SELECT topic, content, embedding_json FROM knowledge_base WHERE embedding_json IS NOT NULL")
        rows = db.execute(sql).fetchall()
        if not rows:
            return []

        scored_chunks: list[tuple[float, dict]] = []
        for row in rows:
            try:
                emb = json.loads(row.embedding_json)
                sim = _cosine_similarity(query_embedding, emb)
                scored_chunks.append((sim, {"topic": row.topic, "content": row.content}))
            except Exception:
                continue

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for _, chunk in scored_chunks[:top_k]]
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Prompt construction
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = (
    "You are AlgoLens Assistant, an expert tutor for the Design and Analysis of "
    "Algorithms (DAA) curriculum. Answer the student's question clearly and concisely "
    "using the provided context. If the context does not contain enough information, "
    "say so honestly rather than inventing details. Use examples and complexity "
    "notation (Big-O) wherever helpful. Keep answers under 300 words."
)


def build_prompt(
    question: str,
    context_chunks: list[dict],
) -> list[dict]:
    """Build the chat messages list for a RAG query.

    Args:
        question: The student's natural-language question.
        context_chunks: Retrieved knowledge-base chunks (topic + content dicts).

    Returns:
        A list of ``{"role": ..., "content": ...}`` dicts.
    """
    if context_chunks:
        context_text = "\n\n".join(
            f"[{chunk['topic']}]\n{chunk['content']}"
            for chunk in context_chunks
        )
        user_content = (
            f"Context from the AlgoLens curriculum:\n\n"
            f"{context_text}\n\n"
            f"---\n\n"
            f"Student question: {question}"
        )
    else:
        user_content = f"Student question: {question}"

    return [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]


# ---------------------------------------------------------------------------
# Chat completion
# ---------------------------------------------------------------------------

def chat_completion(messages: list[dict]) -> str:
    """Call Google Gemini (or OpenAI) and return the assistant's reply string.

    Args:
        messages: The messages list from :func:`build_prompt`.

    Returns:
        The assistant reply text.

    Raises:
        RuntimeError: If neither GEMINI_API_KEY nor OPENAI_API_KEY is configured.
        Exception: On API errors.
    """
    sys_prompt = _SYSTEM_PROMPT
    user_prompt = ""
    for m in messages:
        if m.get("role") == "system":
            sys_prompt = m.get("content", sys_prompt)
        elif m.get("role") == "user":
            user_prompt = m.get("content", "")

    if settings.GEMINI_API_KEY:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        models_to_try = [
            settings.GEMINI_CHAT_MODEL,
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
            "gemini-flash-latest",
        ]
        # Remove duplicates while preserving order
        seen = set()
        unique_models = [m for m in models_to_try if not (m in seen or seen.add(m))]

        last_err = None
        for mod in unique_models:
            try:
                response = client.models.generate_content(
                    model=mod,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=sys_prompt,
                        temperature=0.3,
                        max_output_tokens=600,
                    ),
                )
                return response.text or ""
            except Exception as e:
                last_err = e
                continue

        if last_err:
            raise last_err

    if settings.OPENAI_API_KEY:
        import openai

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=settings.OPENAI_CHAT_MODEL,
            messages=messages,  # type: ignore[arg-type]
            temperature=0.3,
            max_tokens=600,
        )
        return response.choices[0].message.content or ""

    raise RuntimeError("GEMINI_API_KEY is not configured.")
