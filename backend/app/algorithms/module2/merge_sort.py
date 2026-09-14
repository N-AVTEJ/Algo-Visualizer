"""Merge Sort implementation with complete tree/split/merge step trace generation."""
from typing import Any, Dict, List, Union

Number = Union[int, float]


def run_merge_sort(array: List[Number]) -> Dict[str, Any]:
    """Execute Merge Sort on an array and return a deterministic step trace.

    Returns:
        Dict containing:
            - steps: Chronological trace of split and merge events
            - comparisons: Total count of comparisons executed
            - result_array: Sorted array
            - metrics: Summary operational telemetry
    """
    steps: List[Dict[str, Any]] = []
    comparisons = 0
    max_depth = 0
    arr = list(array)

    if len(arr) == 0:
        return {
            "steps": [],
            "comparisons": 0,
            "result_array": [],
            "metrics": {"comparisons": 0, "max_depth": 0, "total_steps": 0},
        }

    # Initial snapshot
    steps.append({
        "action": "init",
        "array": list(arr),
        "left": 0,
        "right": len(arr) - 1,
        "mid": (len(arr) - 1) // 2,
        "depth": 0,
        "comparisons": 0,
        "node_id": f"0_0_{len(arr) - 1}",
        "parent_id": None,
        "sub_array": list(arr),
    })

    def merge(left: int, mid: int, right: int, depth: int, parent_id: str):
        nonlocal comparisons
        left_part = arr[left : mid + 1]
        right_part = arr[mid + 1 : right + 1]

        i = 0
        j = 0
        k = left
        node_id = f"{depth}_{left}_{right}"

        while i < len(left_part) and j < len(right_part):
            comparisons += 1
            is_less = left_part[i] <= right_part[j]

            steps.append({
                "action": "merge_compare",
                "array": list(arr),
                "left": left,
                "right": right,
                "mid": mid,
                "depth": depth,
                "comparisons": comparisons,
                "node_id": node_id,
                "parent_id": parent_id,
                "comparing": [left_part[i], right_part[j]],
                "indices": [left + i, mid + 1 + j],
            })

            if is_less:
                arr[k] = left_part[i]
                i += 1
            else:
                arr[k] = right_part[j]
                j += 1

            steps.append({
                "action": "merge_place",
                "array": list(arr),
                "left": left,
                "right": right,
                "mid": mid,
                "depth": depth,
                "comparisons": comparisons,
                "placed_index": k,
                "placed_value": arr[k],
                "node_id": node_id,
            })
            k += 1

        while i < len(left_part):
            arr[k] = left_part[i]
            steps.append({
                "action": "merge_place",
                "array": list(arr),
                "left": left,
                "right": right,
                "mid": mid,
                "depth": depth,
                "comparisons": comparisons,
                "placed_index": k,
                "placed_value": arr[k],
                "node_id": node_id,
            })
            i += 1
            k += 1

        while j < len(right_part):
            arr[k] = right_part[j]
            steps.append({
                "action": "merge_place",
                "array": list(arr),
                "left": left,
                "right": right,
                "mid": mid,
                "depth": depth,
                "comparisons": comparisons,
                "placed_index": k,
                "placed_value": arr[k],
                "node_id": node_id,
            })
            j += 1
            k += 1

        steps.append({
            "action": "merged",
            "array": list(arr),
            "left": left,
            "right": right,
            "mid": mid,
            "depth": depth,
            "comparisons": comparisons,
            "node_id": node_id,
            "parent_id": parent_id,
            "sub_array": list(arr[left : right + 1]),
        })

    def sort(left: int, right: int, depth: int, parent_id: Union[str, None]):
        nonlocal max_depth
        if depth > max_depth:
            max_depth = depth

        node_id = f"{depth}_{left}_{right}"

        if left < right:
            mid = (left + right) // 2

            steps.append({
                "action": "split",
                "array": list(arr),
                "left": left,
                "right": right,
                "mid": mid,
                "depth": depth,
                "comparisons": comparisons,
                "node_id": node_id,
                "parent_id": parent_id,
                "left_child": f"{depth + 1}_{left}_{mid}",
                "right_child": f"{depth + 1}_{mid + 1}_{right}",
                "sub_array": list(arr[left : right + 1]),
            })

            sort(left, mid, depth + 1, node_id)
            sort(mid + 1, right, depth + 1, node_id)
            merge(left, mid, right, depth, parent_id)
        else:
            # Base case: single element
            steps.append({
                "action": "base_case",
                "array": list(arr),
                "left": left,
                "right": right,
                "mid": left,
                "depth": depth,
                "comparisons": comparisons,
                "node_id": node_id,
                "parent_id": parent_id,
                "sub_array": [arr[left]],
            })

    sort(0, len(arr) - 1, 0, None)

    return {
        "steps": steps,
        "comparisons": comparisons,
        "result_array": list(arr),
        "metrics": {
            "comparisons": comparisons,
            "max_depth": max_depth,
            "total_steps": len(steps),
        },
    }
