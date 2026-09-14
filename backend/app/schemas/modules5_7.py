"""Pydantic schemas for Modules 5, 6, and 7 algorithm endpoints."""
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

Number = Union[int, float]


# ============================================================================
# MODULE 5: 0/1 Knapsack
# ============================================================================

class KnapsackItem(BaseModel):
    id: str = Field(..., description="Unique label for the item")
    weight: int = Field(..., gt=0, description="Positive item weight")
    value: Number = Field(..., ge=0, description="Non-negative item value")


class Module5RunRequest(BaseModel):
    items: Optional[List[KnapsackItem]] = Field(
        None,
        max_length=15,
        description="List of items (1 to 15 items). If omitted, default dataset is used.",
    )
    capacity: Optional[int] = Field(
        None,
        ge=1,
        le=30,
        description="Knapsack capacity limit (1 to 30). If omitted, default is 8.",
    )


class Module5RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Chronological DP cell-filling and backtracking steps")
    max_value: Number = Field(..., description="Maximum optimal achievable value")
    selected_items: List[int] = Field(..., description="Indices of selected items in the optimal knapsack")
    total_weight: int = Field(..., description="Total weight of selected items")
    total_value: Number = Field(..., description="Total value of selected items")
    dp_table: List[List[Number]] = Field(..., description="Final 2D dynamic programming table")
    items: List[Dict[str, Any]] = Field(..., description="Items considered in the problem")
    capacity: int = Field(..., description="Knapsack capacity limit")
    metrics: Dict[str, Any] = Field(..., description="Summary operational metrics")


# ============================================================================
# MODULE 6: Job Sequencing with Deadlines
# ============================================================================

class JobItem(BaseModel):
    id: str = Field(..., description="Unique job identifier")
    deadline: int = Field(..., ge=1, le=15, description="Job deadline slot integer (>= 1)")
    profit: Number = Field(..., gt=0, description="Job profit value (> 0)")


class Module6RunRequest(BaseModel):
    jobs: Optional[List[JobItem]] = Field(
        None,
        max_length=20,
        description="List of jobs (1 to 20 jobs). If omitted, default jobs are used.",
    )
    max_slots: Optional[int] = Field(
        None,
        ge=1,
        le=15,
        description="Optional upper bound on timeline slots",
    )


class Module6RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Chronological timeline decision steps")
    scheduled_jobs: List[str] = Field(..., description="List of job IDs successfully allocated")
    timeline: List[Dict[str, Any]] = Field(..., description="Slot-by-slot final schedule")
    total_profit: Number = Field(..., description="Total accumulated profit")
    max_slots: int = Field(..., description="Timeline slot capacity")
    sorted_jobs: List[Dict[str, Any]] = Field(..., description="Jobs sorted by profit descending")
    metrics: Dict[str, Any] = Field(..., description="Summary operational metrics")


# ============================================================================
# MODULE 7: Kruskal's Minimum Spanning Tree
# ============================================================================

class KruskalEdge(BaseModel):
    u: str = Field(..., description="Source vertex identifier")
    v: str = Field(..., description="Destination vertex identifier")
    weight: Number = Field(..., description="Edge weight")


class Module7RunRequest(BaseModel):
    vertices: Optional[List[str]] = Field(
        None,
        max_length=12,
        description="List of unique vertex identifiers. If omitted, default graph is used.",
    )
    edges: Optional[List[KruskalEdge]] = Field(
        None,
        max_length=30,
        description="List of weighted edges. If omitted, default graph is used.",
    )


class Module7RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Chronological Kruskal decision steps")
    mst_edges: List[Dict[str, Any]] = Field(..., description="Edges included in the final MST")
    rejected_edges: List[Dict[str, Any]] = Field(..., description="Edges rejected due to cycles")
    total_weight: Number = Field(..., description="Total weight of minimum spanning tree")
    is_connected: bool = Field(..., description="True if a single spanning tree connected all vertices")
    vertices: List[str] = Field(..., description="Graph vertices")
    edges: List[Dict[str, Any]] = Field(..., description="Graph input edges")
    sorted_edges: List[Dict[str, Any]] = Field(..., description="Edges in non-decreasing weight order")
    metrics: Dict[str, Any] = Field(..., description="Summary operational metrics")
