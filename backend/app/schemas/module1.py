"""Pydantic schemas for Module 1 — Algorithm Analysis endpoint."""
from typing import Any, Dict, List, Literal, Union
from pydantic import BaseModel, Field

Number = Union[int, float]


class Module1RunRequest(BaseModel):
    array: List[Number] = Field(..., description="Array of numbers to search within")
    target: Number = Field(..., description="Target value to locate")
    algorithm: Literal["linear", "binary"] = Field(
        ...,
        description="Algorithm to execute ('linear' or 'binary')",
    )


class Module1RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Chronological trace of algorithm steps")
    comparisons: int = Field(..., description="Total comparisons executed by the algorithm")
    result_index: int = Field(..., description="Index of target if found, else -1")
