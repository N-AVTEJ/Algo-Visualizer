"""Pydantic schemas for the AI Assistant endpoint."""
from typing import List
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    """Request body for POST /api/ai/ask."""

    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="The student's natural-language question about algorithms.",
    )


class AskResponse(BaseModel):
    """Response from POST /api/ai/ask."""

    answer: str = Field(
        ...,
        description="The AI assistant's answer to the student's question.",
    )
    sources: List[str] = Field(
        default_factory=list,
        description="Topics of the knowledge-base chunks used to generate the answer.",
    )
