"""0/1 Knapsack dynamic programming algorithm with complete DP table and backtracking trace."""
from typing import Any, Dict, List, Optional, Union

Number = Union[int, float]


def get_default_knapsack_data() -> Dict[str, Any]:
    """Return a standard 0/1 knapsack problem instance suitable for visualization."""
    return {
        "items": [
            {"id": "Item 1", "weight": 2, "value": 3},
            {"id": "Item 2", "weight": 3, "value": 4},
            {"id": "Item 3", "weight": 4, "value": 5},
            {"id": "Item 4", "weight": 5, "value": 6},
        ],
        "capacity": 8,
    }


def run_knapsack(
    items: Optional[List[Dict[str, Any]]] = None,
    capacity: Optional[int] = None,
) -> Dict[str, Any]:
    """Execute 0/1 Knapsack DP algorithm and generate a comprehensive step trace.

    Steps cover:
    1. DP Table Computation (filling cell-by-cell).
    2. Backtracking path to recover selected optimal items.

    Args:
        items: List of dicts with 'id', 'weight', and 'value'.
        capacity: Maximum knapsack capacity integer.

    Returns:
        Dict containing:
            - steps: Chronological DP filling and backtracking steps
            - max_value: Maximum achievable value
            - selected_items: List of selected item indices
            - total_weight: Total weight of chosen items
            - total_value: Total value of chosen items
            - dp_table: Final 2D DP matrix
            - items: Items array
            - capacity: Max capacity
            - metrics: Summary operational counters
    """
    if items is None or capacity is None:
        default = get_default_knapsack_data()
        items = default["items"]
        capacity = default["capacity"]

    n = len(items)
    if n < 1 or n > 15:
        raise ValueError("Item count must be between 1 and 15.")
    if capacity < 1 or capacity > 30:
        raise ValueError("Capacity must be between 1 and 30.")

    for idx, it in enumerate(items):
        if "weight" not in it or "value" not in it:
            raise ValueError(f"Item at index {idx} missing weight or value.")
        if it["weight"] <= 0 or it["value"] < 0:
            raise ValueError(f"Item at index {idx} must have positive weight and non-negative value.")

    # Initialize (n+1) x (capacity+1) DP table with zeros
    dp: List[List[Number]] = [[0] * (capacity + 1) for _ in range(n + 1)]
    steps: List[Dict[str, Any]] = []

    def clone_dp() -> List[List[Number]]:
        return [list(row) for row in dp]

    # Initial zero row snapshot
    steps.append({
        "phase": "init",
        "row": 0,
        "col": 0,
        "item_index": None,
        "item_weight": None,
        "item_value": None,
        "prev_dp": None,
        "candidate_val": None,
        "result_val": 0,
        "included": False,
        "dp_table": clone_dp(),
        "selected_items": [],
        "running_weight": 0,
        "running_value": 0,
        "explanation": "Initialized DP table with base cases (0 items or 0 capacity = 0 value).",
        "metrics": {
            "max_value": 0,
            "selected_count": 0,
            "total_weight": 0,
            "total_value": 0,
            "current_step": 1,
        },
    })

    # =========================================================================
    # Phase 1: DP Table Computation
    # =========================================================================
    for i in range(1, n + 1):
        item = items[i - 1]
        wt = item["weight"]
        val = item["value"]
        item_id = item.get("id", f"Item {i}")

        for w in range(1, capacity + 1):
            prev_val = dp[i - 1][w]
            candidate_val = None
            included = False

            if wt <= w:
                candidate_val = val + dp[i - 1][w - wt]
                if candidate_val > prev_val:
                    dp[i][w] = candidate_val
                    included = True
                else:
                    dp[i][w] = prev_val
            else:
                dp[i][w] = prev_val

            exp = (
                f"Cell ({i}, {w}) for '{item_id}' (wt: {wt}, val: {val}): "
                + (
                    f"Fit possible! Compare include ({val} + dp[{i-1}][{w-wt}]={candidate_val}) "
                    f"vs exclude (dp[{i-1}][{w}]={prev_val}) -> {'INCLUDE' if included else 'EXCLUDE'}."
                    if wt <= w
                    else f"Item too heavy ({wt} > {w}) -> inherit exclude value {prev_val}."
                )
            )

            steps.append({
                "phase": "table_fill",
                "row": i,
                "col": w,
                "item_index": i - 1,
                "item_weight": wt,
                "item_value": val,
                "prev_dp": prev_val,
                "candidate_val": candidate_val,
                "result_val": dp[i][w],
                "included": included,
                "dp_table": clone_dp(),
                "selected_items": [],
                "running_weight": 0,
                "running_value": 0,
                "explanation": exp,
                "metrics": {
                    "max_value": dp[i][w],
                    "selected_count": 0,
                    "total_weight": 0,
                    "total_value": 0,
                    "current_step": len(steps) + 1,
                },
            })

    # =========================================================================
    # Phase 2: Backtracking
    # =========================================================================
    selected_indices: List[int] = []
    curr_i = n
    curr_w = capacity
    running_wt = 0
    running_val = 0

    while curr_i > 0 and curr_w > 0:
        current_cell_val = dp[curr_i][curr_w]
        above_cell_val = dp[curr_i - 1][curr_w]
        item = items[curr_i - 1]
        item_id = item.get("id", f"Item {curr_i}")
        item_wt = item["weight"]
        item_val = item["value"]

        # If value differs from cell directly above, item was included
        is_selected = current_cell_val != above_cell_val

        if is_selected:
            selected_indices.append(curr_i - 1)
            running_wt += item_wt
            running_val += item_val
            next_i = curr_i - 1
            next_w = curr_w - item_wt
            exp = (
                f"Backtracking at ({curr_i}, {curr_w}): DP value {current_cell_val} != above cell {above_cell_val}. "
                f"Item '{item_id}' WAS SELECTED. Move to ({next_i}, {next_w})."
            )
        else:
            next_i = curr_i - 1
            next_w = curr_w
            exp = (
                f"Backtracking at ({curr_i}, {curr_w}): DP value {current_cell_val} == above cell {above_cell_val}. "
                f"Item '{item_id}' was SKIPPED. Move to ({next_i}, {next_w})."
            )

        steps.append({
            "phase": "backtrack",
            "row": curr_i,
            "col": curr_w,
            "item_index": curr_i - 1,
            "item_weight": item_wt,
            "item_value": item_val,
            "prev_dp": above_cell_val,
            "candidate_val": current_cell_val,
            "result_val": current_cell_val,
            "included": is_selected,
            "dp_table": clone_dp(),
            "selected_items": list(selected_indices),
            "running_weight": running_wt,
            "running_value": running_val,
            "next_row": next_i,
            "next_col": next_w,
            "explanation": exp,
            "metrics": {
                "max_value": dp[n][capacity],
                "selected_count": len(selected_indices),
                "total_weight": running_wt,
                "total_value": running_val,
                "current_step": len(steps) + 1,
            },
        })

        curr_i = next_i
        curr_w = next_w

    selected_indices.reverse()

    # Final summary step
    steps.append({
        "phase": "completed",
        "row": 0,
        "col": 0,
        "item_index": None,
        "item_weight": None,
        "item_value": None,
        "prev_dp": None,
        "candidate_val": None,
        "result_val": dp[n][capacity],
        "included": False,
        "dp_table": clone_dp(),
        "selected_items": list(selected_indices),
        "running_weight": running_wt,
        "running_value": running_val,
        "explanation": f"Optimal Knapsack complete! Max Value = {dp[n][capacity]}, Total Weight = {running_wt}/{capacity}.",
        "metrics": {
            "max_value": dp[n][capacity],
            "selected_count": len(selected_indices),
            "total_weight": running_wt,
            "total_value": running_val,
            "current_step": len(steps) + 1,
        },
    })

    return {
        "steps": steps,
        "max_value": dp[n][capacity],
        "selected_items": selected_indices,
        "total_weight": running_wt,
        "total_value": running_val,
        "dp_table": clone_dp(),
        "items": items,
        "capacity": capacity,
        "metrics": {
            "items_count": n,
            "capacity": capacity,
            "max_value": dp[n][capacity],
            "selected_count": len(selected_indices),
            "total_weight": running_wt,
            "total_value": running_val,
            "total_steps": len(steps),
        },
    }
