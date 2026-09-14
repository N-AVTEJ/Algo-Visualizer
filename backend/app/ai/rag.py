"""RAG (Retrieval-Augmented Generation) pipeline.

Two responsibilities:
1. ``retrieve_context`` — raw-SQL cosine similarity search against pgvector.
2. ``build_prompt``     — assemble the OpenAI chat messages list.
3. ``chat_completion``  — call ``gpt-4o-mini`` and return the answer string.
"""
from __future__ import annotations

import json
from typing import TYPE_CHECKING

import openai
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings

if TYPE_CHECKING:
    pass


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

def retrieve_context(
    query_embedding: list[float],
    db: Session,
    top_k: int = 5,
) -> list[dict]:
    """Retrieve the top-*k* most relevant knowledge-base chunks.

    Uses the pgvector ``<=>`` cosine-distance operator via raw SQL.
    Falls back to an empty list if the ``knowledge_base`` table has no
    ``embedding`` vector column (i.e., on SQLite / fresh install).

    Args:
        query_embedding: 1536-dim float list from :func:`~app.ai.embeddings.get_embedding`.
        db: Active SQLAlchemy session.
        top_k: Number of chunks to retrieve.

    Returns:
        List of dicts with keys ``topic`` and ``content``.
    """
    # Serialize embedding to a Postgres-compatible literal: '[0.1,0.2,...]'
    vec_literal = "[" + ",".join(str(v) for v in query_embedding) + "]"

    sql = text(
        """
        SELECT topic, content
        FROM   knowledge_base
        ORDER  BY embedding <=> CAST(:vec AS vector)
        LIMIT  :k
        """
    )

    try:
        rows = db.execute(sql, {"vec": vec_literal, "k": top_k}).fetchall()
        return [{"topic": row.topic, "content": row.content} for row in rows]
    except Exception:
        # pgvector not available (SQLite, no extension, empty table) — return nothing.
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
    """Build the OpenAI chat messages list for a RAG query.

    Args:
        question: The student's natural-language question.
        context_chunks: Retrieved knowledge-base chunks (topic + content dicts).

    Returns:
        A list of ``{"role": ..., "content": ...}`` dicts suitable for
        ``openai.chat.completions.create(messages=...)``.
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
    """Call ``gpt-4o-mini`` and return the assistant's reply as a string.

    Args:
        messages: The messages list from :func:`build_prompt`.

    Returns:
        The assistant reply text.

    Raises:
        openai.OpenAIError: On API errors.
        RuntimeError: If ``OPENAI_API_KEY`` is not configured.
    """
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        messages=messages,  # type: ignore[arg-type]
        temperature=0.3,
        max_tokens=600,
    )
    return response.choices[0].message.content or ""
