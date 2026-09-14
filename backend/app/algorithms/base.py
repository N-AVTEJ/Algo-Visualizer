"""Algorithm Step-Trace Convention & Base Type Definitions.

This module defines the architectural contract that all algorithm implementations
across Modules 1 through 10 must follow.

Convention Overview:
1. Pure Function Execution:
   Algorithm implementations are pure functions that accept input data and return
   a complete, deterministic trace dictionary.
2. Step Chronology:
   `steps` represents an ordered sequence of discrete, immutable states representing
   actual algorithm execution. Steps must NOT be fabricated purely for animation aesthetics.
3. Separation of Concerns:
   The frontend consumes the trace array to drive step-by-step visualizations without
   re-executing algorithmic logic in the browser.
4. Measurable Metrics:
   `metrics` contains measurable operational data (comparisons, allocations, swaps,
   recursion depth) calculated during the actual execution.
"""
from typing import Any, Dict, List, Optional, Protocol, TypedDict, Union

Number = Union[int, float]
MetricValue = Union[int, float, str, bool]


class StepTrace(TypedDict, total=False):
    """Generic representation of a single algorithm step."""
    index: Optional[int]
    value: Optional[Any]
    action: str
    comparisons: Optional[int]
    found: Optional[bool]


class AlgorithmResult(TypedDict, total=False):
    """Standardized envelope returned by all AlgoLens algorithm runners.

    Attributes:
        steps: Chronological sequence of algorithm states/actions.
        comparisons: Cumulative comparisons count (where applicable).
        result_index: Resulting element index or identifier (-1 if not found).
        metrics: Dictionary of execution telemetry (e.g. operations, swaps).
    """
    steps: List[Dict[str, Any]]
    comparisons: Optional[int]
    result_index: Optional[int]
    metrics: Optional[Dict[str, MetricValue]]


class AlgorithmRunner(Protocol):
    """Protocol signature for algorithm execution functions."""
    def __call__(self, *args: Any, **kwargs: Any) -> AlgorithmResult:
        ...
