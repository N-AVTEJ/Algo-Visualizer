"""0/1 Knapsack Branch & Bound algorithm with complete state-space search tree trace."""
from typing import Any, Dict, List, Optional, Tuple, Union

Number = Union[int, float]


def get_default_branch_bound_data() -> Dict[str, Any]:
    """Return a standard 0/1 Knapsack problem instance for Branch & Bound visualization."""
    return {
        "items": [
            {"id": "Item 1", "weight": 2, "value": 40},
            {"id": "Item 2", "weight": 3.14 if False else 3, "value": 50},
            {"id": "Item 3", "weight": 1, "value": 100},
            {"id": "Item 4", "weight": 5, "value": 95},
            {"id": "Item 5", "weight": 3, "value": 30},
        ],
        "capacity": 10,
    }


def compute_upper_bound(
    level: int,
    current_weight: Number,
    current_value: Number,
    capacity: Number,
    items: List[Dict[str, Any]],
) -> Number:
    """Compute upper bound on maximum profit using fractional knapsack relaxation.

    Items are assumed to be sorted in non-increasing order of value/weight ratio.
    """
    if current_weight >= capacity:
        return 0

    bound = float(current_value)
    tot_weight = float(current_weight)
    n = len(items)

    for i in range(level, n):
        item_w = float(items[i]["weight"])
        item_v = float(items[i]["value"])
        if tot_weight + item_w <= capacity:
            tot_weight += item_w
            bound += item_v
        else:
            remaining_cap = capacity - tot_weight
            bound += item_v * (remaining_cap / item_w)
            break

    return round(bound, 2)


def run_branch_bound(
    items: Optional[List[Dict[str, Any]]] = None,
    capacity: Optional[int] = None,
) -> Dict[str, Any]:
    """Execute 0/1 Knapsack Branch & Bound algorithm and generate a step trace.

    Search Strategy:
    Items are sorted by value/weight ratio descending.
    A priority-queue or depth-first / best-first exploration evaluates the state-space tree.
    To provide the clearest pedagogical tree progression, we explore level-by-level (or DFS/best-bound),
    explicitly recording node creation, expansion, bound calculation, pruning, and solution updates.

    Returns:
        Dict containing:
            - steps: Detailed trace of the search process
            - optimal_value: Maximum achievable knapsack value
            - selected_items: Selected item IDs / indices
            - final_weight: Weight of optimal selection
            - tree_nodes: All generated nodes with parent-child links and final statuses
            - metrics: Summary counters (nodes explored, pruned, max depth, etc.)
    """
    if items is None or capacity is None:
        default = get_default_branch_bound_data()
        items = default["items"]
        capacity = default["capacity"]

    n = len(items)
    if n < 1 or n > 12:
        raise ValueError("Item count must be between 1 and 12 for Branch & Bound visualization.")
    if capacity <= 0 or capacity > 100:
        raise ValueError("Capacity must be between 1 and 100.")

    processed_items: List[Dict[str, Any]] = []
    for idx, item in enumerate(items):
        if "weight" not in item or "value" not in item:
            raise ValueError(f"Item at index {idx} missing 'weight' or 'value'.")
        w = item["weight"]
        v = item["value"]
        if w <= 0:
            raise ValueError(f"Item {idx} weight must be positive.")
        if v < 0:
            raise ValueError(f"Item {idx} value must be non-negative.")
        processed_items.append({
            "id": str(item.get("id", f"Item {idx + 1}")),
            "original_index": idx,
            "weight": w,
            "value": v,
            "ratio": round(v / w, 4),
        })

    # Sort items by value/weight ratio descending for tightest fractional relaxation bound
    sorted_items = sorted(processed_items, key=lambda x: x["ratio"], reverse=True)

    steps: List[Dict[str, Any]] = []
    nodes: Dict[str, Dict[str, Any]] = {}

    best_value: Number = 0
    best_selected_items: List[str] = []
    best_node_id: Optional[str] = None
    nodes_created_count = 0
    nodes_expanded_count = 0
    nodes_pruned_count = 0
    max_depth_reached = 0

    # Root node (level 0, no items decided yet)
    root_id = "node_0"
    root_bound = compute_upper_bound(0, 0, 0, capacity, sorted_items)

    root_node = {
        "id": root_id,
        "parent_id": None,
        "depth": 0,
        "item_level": 0,
        "decision": "root",
        "current_weight": 0,
        "current_value": 0,
        "bound": root_bound,
        "feasible": True,
        "pruned": False,
        "prune_reason": None,
        "status": "pending",
        "selected_items": [],
    }
    nodes[root_id] = root_node
    nodes_created_count += 1

    steps.append({
        "step_index": len(steps),
        "action": "node_created",
        "node_id": root_id,
        "parent_id": None,
        "depth": 0,
        "item_level": 0,
        "decision": "Root State",
        "current_weight": 0,
        "current_value": 0,
        "bound": root_bound,
        "feasible": True,
        "can_improve": root_bound > best_value,
        "best_value": best_value,
        "best_selected_items": list(best_selected_items),
        "pruned": False,
        "prune_reason": None,
        "description": f"Root node initialized with upper bound {root_bound} (capacity {capacity}).",
    })

    # Queue for exploration: BFS ensures level-by-level understandable tree generation
    queue: List[str] = [root_id]

    while queue:
        current_id = queue.pop(0)
        curr = nodes[current_id]
        level = curr["item_level"]

        max_depth_reached = max(max_depth_reached, curr["depth"])

        # Check if node can be pruned based on bound before expanding
        if curr["depth"] > 0 and curr["bound"] <= best_value:
            curr["pruned"] = True
            curr["status"] = "pruned"
            curr["prune_reason"] = f"Bound ({curr['bound']}) <= Current Best ({best_value})"
            nodes_pruned_count += 1
            steps.append({
                "step_index": len(steps),
                "action": "branch_pruned",
                "node_id": current_id,
                "parent_id": curr["parent_id"],
                "depth": curr["depth"],
                "item_level": level,
                "decision": curr["decision"],
                "current_weight": curr["current_weight"],
                "current_value": curr["current_value"],
                "bound": curr["bound"],
                "feasible": curr["feasible"],
                "can_improve": False,
                "best_value": best_value,
                "best_selected_items": list(best_selected_items),
                "pruned": True,
                "prune_reason": curr["prune_reason"],
                "description": f"Pruned node {current_id}: bound {curr['bound']} cannot beat current best {best_value}.",
            })
            continue

        curr["status"] = "expanded"
        nodes_expanded_count += 1
        steps.append({
            "step_index": len(steps),
            "action": "node_expanded",
            "node_id": current_id,
            "parent_id": curr["parent_id"],
            "depth": curr["depth"],
            "item_level": level,
            "decision": curr["decision"],
            "current_weight": curr["current_weight"],
            "current_value": curr["current_value"],
            "bound": curr["bound"],
            "feasible": curr["feasible"],
            "can_improve": curr["bound"] > best_value,
            "best_value": best_value,
            "best_selected_items": list(best_selected_items),
            "pruned": False,
            "prune_reason": None,
            "description": f"Expanding node {current_id} at level {level} (weight: {curr['current_weight']}, value: {curr['current_value']}).",
        })

        if level >= n:
            # Reached a leaf node (solution candidate)
            steps.append({
                "step_index": len(steps),
                "action": "solution_candidate",
                "node_id": current_id,
                "parent_id": curr["parent_id"],
                "depth": curr["depth"],
                "item_level": level,
                "decision": curr["decision"],
                "current_weight": curr["current_weight"],
                "current_value": curr["current_value"],
                "bound": curr["bound"],
                "feasible": True,
                "can_improve": curr["current_value"] > best_value,
                "best_value": best_value,
                "best_selected_items": list(best_selected_items),
                "pruned": False,
                "prune_reason": None,
                "description": f"Leaf candidate node reached with value {curr['current_value']}.",
            })
            continue

        next_item = sorted_items[level]
        item_label = next_item["id"]

        # 1. Left branch: INCLUDE item
        include_weight = curr["current_weight"] + next_item["weight"]
        include_value = curr["current_value"] + next_item["value"]
        left_id = f"node_{nodes_created_count}"
        nodes_created_count += 1

        if include_weight <= capacity:
            left_bound = compute_upper_bound(level + 1, include_weight, include_value, capacity, sorted_items)
            left_selected = curr["selected_items"] + [item_label]
            left_node = {
                "id": left_id,
                "parent_id": current_id,
                "depth": curr["depth"] + 1,
                "item_level": level + 1,
                "decision": f"Include {item_label}",
                "current_weight": include_weight,
                "current_value": include_value,
                "bound": left_bound,
                "feasible": True,
                "pruned": False,
                "prune_reason": None,
                "status": "pending",
                "selected_items": left_selected,
            }
            nodes[left_id] = left_node

            steps.append({
                "step_index": len(steps),
                "action": "node_created",
                "node_id": left_id,
                "parent_id": current_id,
                "depth": left_node["depth"],
                "item_level": level + 1,
                "decision": left_node["decision"],
                "current_weight": include_weight,
                "current_value": include_value,
                "bound": left_bound,
                "feasible": True,
                "can_improve": left_bound > best_value,
                "best_value": best_value,
                "best_selected_items": list(best_selected_items),
                "pruned": False,
                "prune_reason": None,
                "description": f"Created child node {left_id}: include {item_label} (weight {include_weight}, value {include_value}, bound {left_bound}).",
            })

            # Check if this viable state updates best solution
            if include_value > best_value:
                best_value = include_value
                best_selected_items = list(left_selected)
                best_node_id = left_id
                steps.append({
                    "step_index": len(steps),
                    "action": "best_solution_updated",
                    "node_id": left_id,
                    "parent_id": current_id,
                    "depth": left_node["depth"],
                    "item_level": level + 1,
                    "decision": left_node["decision"],
                    "current_weight": include_weight,
                    "current_value": include_value,
                    "bound": left_bound,
                    "feasible": True,
                    "can_improve": True,
                    "best_value": best_value,
                    "best_selected_items": list(best_selected_items),
                    "pruned": False,
                    "prune_reason": None,
                    "description": f"New best solution found! Value: {best_value} with items {', '.join(best_selected_items)}.",
                })

            if left_bound > best_value:
                queue.append(left_id)
            else:
                left_node["pruned"] = True
                left_node["status"] = "pruned"
                left_node["prune_reason"] = f"Bound ({left_bound}) <= Current Best ({best_value})"
                nodes_pruned_count += 1
                steps.append({
                    "step_index": len(steps),
                    "action": "branch_pruned",
                    "node_id": left_id,
                    "parent_id": current_id,
                    "depth": left_node["depth"],
                    "item_level": level + 1,
                    "decision": left_node["decision"],
                    "current_weight": include_weight,
                    "current_value": include_value,
                    "bound": left_bound,
                    "feasible": True,
                    "can_improve": False,
                    "best_value": best_value,
                    "best_selected_items": list(best_selected_items),
                    "pruned": True,
                    "prune_reason": left_node["prune_reason"],
                    "description": f"Pruned {left_id}: bound {left_bound} cannot improve current best {best_value}.",
                })
        else:
            # Infeasible branch: weight exceeds capacity
            left_node = {
                "id": left_id,
                "parent_id": current_id,
                "depth": curr["depth"] + 1,
                "item_level": level + 1,
                "decision": f"Include {item_label}",
                "current_weight": include_weight,
                "current_value": include_value,
                "bound": 0,
                "feasible": False,
                "pruned": True,
                "prune_reason": f"Weight ({include_weight}) exceeds capacity ({capacity})",
                "status": "pruned",
                "selected_items": curr["selected_items"] + [item_label],
            }
            nodes[left_id] = left_node
            nodes_pruned_count += 1
            steps.append({
                "step_index": len(steps),
                "action": "branch_pruned",
                "node_id": left_id,
                "parent_id": current_id,
                "depth": left_node["depth"],
                "item_level": level + 1,
                "decision": left_node["decision"],
                "current_weight": include_weight,
                "current_value": include_value,
                "bound": 0,
                "feasible": False,
                "can_improve": False,
                "best_value": best_value,
                "best_selected_items": list(best_selected_items),
                "pruned": True,
                "prune_reason": left_node["prune_reason"],
                "description": f"Pruned {left_id}: weight {include_weight} exceeds capacity {capacity}.",
            })

        # 2. Right branch: EXCLUDE item
        exclude_weight = curr["current_weight"]
        exclude_value = curr["current_value"]
        right_bound = compute_upper_bound(level + 1, exclude_weight, exclude_value, capacity, sorted_items)
        right_id = f"node_{nodes_created_count}"
        nodes_created_count += 1

        right_node = {
            "id": right_id,
            "parent_id": current_id,
            "depth": curr["depth"] + 1,
            "item_level": level + 1,
            "decision": f"Exclude {item_label}",
            "current_weight": exclude_weight,
            "current_value": exclude_value,
            "bound": right_bound,
            "feasible": True,
            "pruned": False,
            "prune_reason": None,
            "status": "pending",
            "selected_items": list(curr["selected_items"]),
        }
        nodes[right_id] = right_node

        steps.append({
            "step_index": len(steps),
            "action": "node_created",
            "node_id": right_id,
            "parent_id": current_id,
            "depth": right_node["depth"],
            "item_level": level + 1,
            "decision": right_node["decision"],
            "current_weight": exclude_weight,
            "current_value": exclude_value,
            "bound": right_bound,
            "feasible": True,
            "can_improve": right_bound > best_value,
            "best_value": best_value,
            "best_selected_items": list(best_selected_items),
            "pruned": False,
            "prune_reason": None,
            "description": f"Created child node {right_id}: exclude {item_label} (weight {exclude_weight}, value {exclude_value}, bound {right_bound}).",
        })

        if right_bound > best_value:
            queue.append(right_id)
        else:
            right_node["pruned"] = True
            right_node["status"] = "pruned"
            right_node["prune_reason"] = f"Bound ({right_bound}) <= Current Best ({best_value})"
            nodes_pruned_count += 1
            steps.append({
                "step_index": len(steps),
                "action": "branch_pruned",
                "node_id": right_id,
                "parent_id": current_id,
                "depth": right_node["depth"],
                "item_level": level + 1,
                "decision": right_node["decision"],
                "current_weight": exclude_weight,
                "current_value": exclude_value,
                "bound": right_bound,
                "feasible": True,
                "can_improve": False,
                "best_value": best_value,
                "best_selected_items": list(best_selected_items),
                "pruned": True,
                "prune_reason": right_node["prune_reason"],
                "description": f"Pruned {right_id}: bound {right_bound} cannot improve current best {best_value}.",
            })

    # Calculate final weight of best selection
    final_weight: Number = 0
    for it in sorted_items:
        if it["id"] in best_selected_items:
            final_weight += it["weight"]

    # Mark the best node in node dictionary
    for nid, nd in nodes.items():
        if nid == best_node_id:
            nd["is_best"] = True
        else:
            nd["is_best"] = False

    metrics = {
        "nodes_created": nodes_created_count,
        "nodes_expanded": nodes_expanded_count,
        "nodes_pruned": nodes_pruned_count,
        "final_best_value": best_value,
        "final_weight": final_weight,
        "selected_item_count": len(best_selected_items),
        "maximum_search_depth": max_depth_reached,
    }

    return {
        "steps": steps,
        "optimal_value": best_value,
        "selected_items": best_selected_items,
        "final_weight": final_weight,
        "tree_nodes": list(nodes.values()),
        "items": sorted_items,
        "capacity": capacity,
        "metrics": metrics,
    }
