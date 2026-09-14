"""Pydantic schemas for Modules 8, 9, and 10 algorithm endpoints."""
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

Number = Union[int, float]


# ============================================================================
# MODULE 8: 0/1 Knapsack Branch & Bound
# ============================================================================

class KnapsackBBItem(BaseModel):
    id: str = Field(..., description="Unique item identifier")
    weight: Number = Field(..., gt=0, description="Positive item weight")
    value: Number = Field(..., ge=0, description="Non-negative item value")


class Module8RunRequest(BaseModel):
    items: Optional[List[KnapsackBBItem]] = Field(
        None,
        max_length=12,
        description="List of items (1 to 12 items). If omitted, default dataset is used.",
    )
    capacity: Optional[int] = Field(
        None,
        ge=1,
        le=100,
        description="Knapsack capacity limit (1 to 100). If omitted, default is 10.",
    )


class Module8RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Chronological Branch & Bound state-space search steps")
    optimal_value: Number = Field(..., description="Maximum achievable knapsack value")
    selected_items: List[str] = Field(..., description="Selected item IDs in the optimal knapsack")
    final_weight: Number = Field(..., description="Total weight of selected items")
    tree_nodes: List[Dict[str, Any]] = Field(..., description="All explored state-space tree nodes")
    items: List[Dict[str, Any]] = Field(..., description="Sorted items used during bounding")
    capacity: int = Field(..., description="Knapsack capacity limit")
    metrics: Dict[str, Any] = Field(..., description="Operational search counters")


# ============================================================================
# MODULE 9: Boolean Satisfiability (SAT)
# ============================================================================

class Module9RunRequest(BaseModel):
    variables: Optional[List[str]] = Field(
        None,
        max_length=12,
        description="List of boolean variables (max 12 for brute-force execution).",
    )
    clauses: Optional[List[List[str]]] = Field(
        None,
        max_length=30,
        description="List of CNF clauses, e.g. [['x1', '~x2'], ['x2', 'x3']].",
    )
    stop_on_first_satisfying: Optional[bool] = Field(
        True,
        description="Whether to halt enumeration upon encountering the first satisfying assignment.",
    )


class Module9RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Truth assignment and clause-level evaluation trace")
    is_satisfiable: bool = Field(..., description="Whether the formula is SAT or UNSAT")
    satisfying_assignment: Optional[Dict[str, bool]] = Field(None, description="Satisfying truth assignment if SAT")
    total_assignments: int = Field(..., description="Total assignment space (2^n)")
    assignments_checked: int = Field(..., description="Total assignments evaluated")
    early_termination: bool = Field(..., description="Whether search halted early")
    variables: List[str] = Field(..., description="Variables list")
    clauses: List[List[str]] = Field(..., description="Clauses list")
    metrics: Dict[str, Any] = Field(..., description="SAT execution metrics")


# ============================================================================
# MODULE 10: Graph Coloring
# ============================================================================

class GraphColoringEdge(BaseModel):
    u: str = Field(..., description="First vertex identifier")
    v: str = Field(..., description="Second vertex identifier")


class Module10RunRequest(BaseModel):
    vertices: Optional[List[str]] = Field(
        None,
        max_length=10,
        description="List of vertex identifiers (max 10).",
    )
    edges: Optional[List[GraphColoringEdge]] = Field(
        None,
        max_length=25,
        description="List of undirected edges.",
    )
    max_colors: Optional[int] = Field(
        None,
        ge=1,
        le=10,
        description="Optional upper bound on colors. If omitted, finds minimal chromatic number.",
    )


class Module10RunResponse(BaseModel):
    steps: List[Dict[str, Any]] = Field(..., description="Backtracking search trace")
    final_coloring: Dict[str, int] = Field(..., description="Final valid vertex color mapping (1-indexed)")
    chromatic_number: int = Field(..., description="Calculated chromatic number")
    is_colorable: bool = Field(..., description="Whether a valid coloring was found")
    vertices: List[str] = Field(..., description="List of vertices")
    edges: List[Dict[str, str]] = Field(..., description="List of undirected edges")
    metrics: Dict[str, Any] = Field(..., description="Graph coloring metrics")
