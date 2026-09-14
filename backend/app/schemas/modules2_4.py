"""Pydantic schemas for Modules 2, 3, and 4 algorithm endpoints."""
from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field

Number = Union[int, float]
NumberOrNone = Optional[Number]


# ============================================================================
# MODULE 2: Divide & Conquer
# ============================================================================

class Module2RunRequest(BaseModel):
    array: List[Number] = Field(
        ...,
        min_length=0,
        max_length=40,
        description="Array of numbers to sort (maximum 40 elements for optimal visualization)",
    )
    algorithm: Literal["merge_sort", "quick_sort"] = Field(
        ...,
        description="Algorithm to execute ('merge_sort' or 'quick_sort')",
    )


class Module2RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Chronological trace of split/merge or partition steps")
    comparisons: int = Field(..., description="Total comparisons performed")
    swaps: Optional[int] = Field(None, description="Total swaps performed (quick sort)")
    result_array: List[Number] = Field(..., description="Sorted resulting array")
    metrics: Dict[str, Any] = Field(..., description="Summary operational metrics")


# ============================================================================
# MODULE 3: Backtracking (N-Queens)
# ============================================================================

class Module3RunRequest(BaseModel):
    n: int = Field(
        8,
        ge=4,
        le=10,
        description="Board dimension N (between 4 and 10, default 8)",
    )
    stop_at_first_solution: bool = Field(
        True,
        description="Whether to halt search upon reaching the first valid solution",
    )


class Module3RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Chronological trace of placements and backtracks")
    n: int = Field(..., description="Board dimension")
    solutions: List[List[int]] = Field(..., description="List of discovered solutions (queen column per row)")
    total_solutions: int = Field(..., description="Count of solutions found")
    metrics: Dict[str, Any] = Field(..., description="Summary search metrics")


# ============================================================================
# MODULE 4: Dynamic Programming I (Floyd-Warshall)
# ============================================================================

class Module4RunRequest(BaseModel):
    matrix: Optional[List[List[NumberOrNone]]] = Field(
        None,
        description="V x V adjacency matrix where None denotes infinity. If omitted, default 4-node graph is used.",
    )
    labels: Optional[List[str]] = Field(
        None,
        description="Optional vertex labels. If omitted, A, B, C... is assigned.",
    )


class Module4RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Chronological trace of (k, i, j) relaxations")
    initial_matrix: List[List[NumberOrNone]] = Field(..., description="Initial input distance matrix")
    final_matrix: List[List[NumberOrNone]] = Field(..., description="Final all-pairs shortest paths distance matrix")
    labels: List[str] = Field(..., description="Vertex labels")
    metrics: Dict[str, Any] = Field(..., description="Summary relaxation counts")
