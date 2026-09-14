"""Linear Search implementation with step-by-step trace generation."""
from typing import Any, Dict, List, Union

Number = Union[int, float]


def run_linear_search(
    array: List[Number],
    target: Number,
) -> Dict[str, Any]:
    """Execute Linear Search on an array and return a deterministic step trace.

    Returns:
        Dict containing:
            - steps: List of trace steps with comparison details
            - comparisons: Total count of comparisons executed
            - result_index: Index of target if found, else -1
    """
    steps: List[Dict[str, Any]] = []
    comparisons = 0
    result_index = -1

    for i, val in enumerate(array):
        comparisons += 1
        is_match = val == target

        steps.append({
            "index": i,
            "value": val,
            "action": "compare",
            "found": is_match,
            "comparisons": comparisons,
        })

        if is_match:
            result_index = i
            break

    return {
        "steps": steps,
        "comparisons": comparisons,
        "result_index": result_index,
    }
