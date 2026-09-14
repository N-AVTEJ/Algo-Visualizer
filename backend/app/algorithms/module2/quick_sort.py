"""Quick Sort implementation with partition/pivot/swap step trace generation."""
from typing import Any, Dict, List, Union

Number = Union[int, float]


def run_quick_sort(array: List[Number]) -> Dict[str, Any]:
    """Execute Quick Sort on an array and return a deterministic step trace.

    Returns:
        Dict containing:
            - steps: Chronological trace of partitioning, comparison, and swap events
            - comparisons: Total comparison count
            - swaps: Total swap count
            - result_array: Sorted array
            - metrics: Operational metrics
    """
    steps: List[Dict[str, Any]] = []
    comparisons = 0
    swaps = 0
    max_depth = 0
    arr = list(array)

    if len(arr) == 0:
        return {
            "steps": [],
            "comparisons": 0,
            "swaps": 0,
            "result_array": [],
            "metrics": {"comparisons": 0, "swaps": 0, "max_depth": 0, "total_steps": 0},
        }

    steps.append({
        "action": "init",
        "array": list(arr),
        "left": 0,
        "right": len(arr) - 1,
        "depth": 0,
        "comparisons": 0,
        "swaps": 0,
        "pivot_index": None,
        "pivot_value": None,
    })

    def partition(low: int, high: int, depth: int) -> int:
        nonlocal comparisons, swaps
        # Choose last element as pivot (Lomuto partition scheme)
        pivot = arr[high]
        pivot_idx = high

        steps.append({
            "action": "pivot_select",
            "array": list(arr),
            "left": low,
            "right": high,
            "pivot_index": pivot_idx,
            "pivot_value": pivot,
            "depth": depth,
            "comparisons": comparisons,
            "swaps": swaps,
        })

        i = low - 1  # Index of smaller element

        for j in range(low, high):
            comparisons += 1
            steps.append({
                "action": "compare",
                "array": list(arr),
                "left": low,
                "right": high,
                "pivot_index": pivot_idx,
                "pivot_value": pivot,
                "i": i,
                "j": j,
                "comparing": [arr[j], pivot],
                "depth": depth,
                "comparisons": comparisons,
                "swaps": swaps,
            })

            if arr[j] <= pivot:
                i += 1
                if i != j:
                    arr[i], arr[j] = arr[j], arr[i]
                    swaps += 1
                    steps.append({
                        "action": "swap",
                        "array": list(arr),
                        "left": low,
                        "right": high,
                        "pivot_index": pivot_idx,
                        "pivot_value": pivot,
                        "i": i,
                        "j": j,
                        "swapped": [i, j],
                        "depth": depth,
                        "comparisons": comparisons,
                        "swaps": swaps,
                    })

        # Place pivot at i + 1
        if i + 1 != high:
            arr[i + 1], arr[high] = arr[high], arr[i + 1]
            swaps += 1
            steps.append({
                "action": "pivot_place",
                "array": list(arr),
                "left": low,
                "right": high,
                "pivot_index": i + 1,
                "pivot_value": arr[i + 1],
                "i": i + 1,
                "j": high,
                "swapped": [i + 1, high],
                "depth": depth,
                "comparisons": comparisons,
                "swaps": swaps,
            })

        steps.append({
            "action": "partition_end",
            "array": list(arr),
            "left": low,
            "right": high,
            "pivot_index": i + 1,
            "pivot_value": arr[i + 1],
            "depth": depth,
            "comparisons": comparisons,
            "swaps": swaps,
        })

        return i + 1

    def quick_sort_rec(low: int, high: int, depth: int):
        nonlocal max_depth
        if depth > max_depth:
            max_depth = depth

        if low < high:
            steps.append({
                "action": "partition_start",
                "array": list(arr),
                "left": low,
                "right": high,
                "depth": depth,
                "comparisons": comparisons,
                "swaps": swaps,
            })

            pi = partition(low, high, depth)
            quick_sort_rec(low, pi - 1, depth + 1)
            quick_sort_rec(pi + 1, high, depth + 1)
        elif low == high:
            steps.append({
                "action": "base_case",
                "array": list(arr),
                "left": low,
                "right": high,
                "depth": depth,
                "comparisons": comparisons,
                "swaps": swaps,
                "pivot_index": low,
                "pivot_value": arr[low],
            })

    quick_sort_rec(0, len(arr) - 1, 0)

    steps.append({
        "action": "completed",
        "array": list(arr),
        "left": 0,
        "right": len(arr) - 1,
        "depth": 0,
        "comparisons": comparisons,
        "swaps": swaps,
    })

    return {
        "steps": steps,
        "comparisons": comparisons,
        "swaps": swaps,
        "result_array": list(arr),
        "metrics": {
            "comparisons": comparisons,
            "swaps": swaps,
            "max_depth": max_depth,
            "total_steps": len(steps),
        },
    }
