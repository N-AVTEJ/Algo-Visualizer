"""Binary Search implementation with step-by-step trace generation."""
from typing import Any, Dict, List, Union

Number = Union[int, float]


def is_sorted(arr: List[Number]) -> bool:
    """Validate that the array is monotonically non-decreasing."""
    for i in range(len(arr) - 1):
        if arr[i] > arr[i + 1]:
            return False
    return True


def run_binary_search(
    array: List[Number],
    target: Number,
) -> Dict[str, Any]:
    """Execute Binary Search on a sorted array and return a deterministic step trace.

    Raises:
        ValueError: If the input array is not sorted.

    Returns:
        Dict containing:
            - steps: List of trace steps with boundaries and comparison details
            - comparisons: Total count of comparisons executed
            - result_index: Index of target if found, else -1
    """
    if not is_sorted(array):
        raise ValueError("Binary search requires a sorted array")

    steps: List[Dict[str, Any]] = []
    comparisons = 0
    result_index = -1

    left = 0
    right = len(array) - 1

    while left <= right:
        mid = (left + right) // 2
        val = array[mid]
        comparisons += 1
        is_match = val == target

        steps.append({
            "index": mid,
            "value": val,
            "action": "compare",
            "found": is_match,
            "comparisons": comparisons,
            "left": left,
            "right": right,
            "mid": mid,
        })

        if is_match:
            result_index = mid
            break
        elif val < target:
            left = mid + 1
        else:
            right = mid - 1

    return {
        "steps": steps,
        "comparisons": comparisons,
        "result_index": result_index,
    }
