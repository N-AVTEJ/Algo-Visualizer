"""AI Assistant API router.

POST /api/ai/ask
    Protected endpoint that answers algorithm questions using a lean RAG pipeline:
    1. Embed the question with text-embedding-3-small.
    2. Retrieve top-5 relevant knowledge-base chunks via pgvector cosine search.
    3. Build a system+user prompt with the retrieved context.
    4. Call gpt-4o-mini for the final answer.
    5. Return the answer and source topics.

Graceful degradation:
    - OPENAI_API_KEY not set → HTTP 503 (rest of app unaffected).
    - knowledge_base table empty / pgvector unavailable → answers without context.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.ai import AskRequest, AskResponse
from app.ai.embeddings import get_embedding
from app.ai.rag import retrieve_context, build_prompt, chat_completion

router = APIRouter()


@router.post(
    "/ask",
    response_model=AskResponse,
    summary="Ask the AI Assistant a question about algorithms",
)
def ask(
    request: AskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AskResponse:
    """RAG-powered Q&A endpoint.

    Requires authentication. API key costs are thus attributed per user session
    and not exposed to anonymous callers.
    """
    # Guard: AI is not usable without an API key.
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI assistant is not configured. "
                "Set OPENAI_API_KEY in backend/.env to enable this feature."
            ),
        )

    try:
        # 1. Embed the question.
        query_embedding = get_embedding(request.question)

        # 2. Retrieve relevant context chunks.
        chunks = retrieve_context(query_embedding, db, top_k=5)

        # 3. Build the chat prompt.
        messages = build_prompt(request.question, chunks)

        # 4. Call the language model.
        answer = chat_completion(messages)

        # 5. Collect unique source topics for provenance display.
        sources = list(dict.fromkeys(chunk["topic"] for chunk in chunks))

        return AskResponse(answer=answer, sources=sources)

    except RuntimeError as exc:
        # Raised by embeddings.py / rag.py when API key is missing at runtime.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    except Exception as exc:
        # Catch-all for OpenAI API errors, network failures, etc.
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(exc)}",
        )
