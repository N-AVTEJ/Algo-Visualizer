"""Graph Coloring backtracking algorithm with explicit conflict detection and chromatic number search."""
from typing import Any, Dict, List, Optional, Set, Tuple, Union


def get_default_graph_coloring_data() -> Dict[str, Any]:
    """Return a standard graph for graph coloring visualization (Petersen-like or 5-vertex cycle with chords)."""
    return {
        "vertices": ["A", "B", "C", "D", "E"],
        "edges": [
            {"u": "A", "v": "B"},
            {"u": "B", "v": "C"},
            {"u": "C", "v": "D"},
            {"u": "D", "v": "E"},
            {"u": "E", "v": "A"},
            {"u": "A", "v": "C"},
        ],
        "max_colors": 3,
    }


def run_graph_coloring(
    vertices: Optional[List[str]] = None,
    edges: Optional[List[Dict[str, str]]] = None,
    max_colors: Optional[int] = None,
) -> Dict[str, Any]:
    """Execute Graph Coloring backtracking algorithm to find a valid coloring and chromatic number.

    Args:
        vertices: List of unique vertex identifiers.
        edges: List of undirected edges {'u': str, 'v': str}.
        max_colors: Optional upper bound on colors. If omitted, determines minimal chromatic number.

    Returns:
        Dict containing:
            - steps: Detailed trace of attempts, conflicts, assignments, and backtracks
            - final_coloring: Dict mapping vertex to color integer (1-indexed)
            - chromatic_number: Minimum number of colors needed
            - is_colorable: Whether a valid coloring was found
            - vertices: List of vertices
            - edges: List of edges
            - metrics: Summary operational counters
    """
    if vertices is None or edges is None:
        default = get_default_graph_coloring_data()
        vertices = default["vertices"]
        edges = default["edges"]
        if max_colors is None:
            max_colors = default.get("max_colors", 3)

    # Validation
    if not isinstance(vertices, list) or len(vertices) == 0:
        raise ValueError("Vertices must be a non-empty list.")
    if len(vertices) > 10:
        raise ValueError("Graph vertex count cannot exceed 10 for interactive backtracking.")

    seen_vertices: Set[str] = set()
    clean_vertices: List[str] = []
    for v in vertices:
        v_str = str(v).strip()
        if not v_str:
            raise ValueError("Vertex identifier cannot be empty.")
        if v_str in seen_vertices:
            raise ValueError(f"Duplicate vertex identifier: '{v_str}'")
        seen_vertices.add(v_str)
        clean_vertices.append(v_str)

    if not isinstance(edges, list):
        raise ValueError("Edges must be a list.")
    if len(edges) > 25:
        raise ValueError("Graph edge count cannot exceed 25.")

    # Build adjacency list
    adj: Dict[str, Set[str]] = {v: set() for v in clean_vertices}
    clean_edges: List[Dict[str, str]] = []
    for idx, e in enumerate(edges):
        if not isinstance(e, dict) or "u" not in e or "v" not in e:
            raise ValueError(f"Edge at index {idx} must have 'u' and 'v' attributes.")
        u = str(e["u"]).strip()
        v = str(e["v"]).strip()
        if u not in seen_vertices or v not in seen_vertices:
            raise ValueError(f"Edge {idx} ({u}, {v}) references unknown vertex.")
        if u == v:
            raise ValueError(f"Self-loop detected on vertex '{u}'. Graph coloring requires simple graphs.")
        adj[u].add(v)
        adj[v].add(u)
        clean_edges.append({"u": u, "v": v})

    # Color search bounds
    if max_colors is not None:
        if max_colors < 1 or max_colors > len(clean_vertices):
            raise ValueError(f"max_colors must be between 1 and {len(clean_vertices)}.")
        target_k_list = [max_colors]
    else:
        # Search incrementally from k = 1 to |V| to find chromatic number
        target_k_list = list(range(1, len(clean_vertices) + 1))

    steps: List[Dict[str, Any]] = []
    colors_attempted_count = 0
    conflicts_count = 0
    backtracks_count = 0
    max_search_depth = 0

    final_coloring: Optional[Dict[str, int]] = None
    chromatic_number: Optional[int] = None
    is_colorable = False

    for k in target_k_list:
        current_coloring: Dict[str, int] = {}
        solved = False

        def backtrack(vertex_idx: int) -> bool:
            nonlocal colors_attempted_count, conflicts_count, backtracks_count, max_search_depth, solved
            if vertex_idx >= len(clean_vertices):
                solved = True
                return True

            curr_v = clean_vertices[vertex_idx]
            max_search_depth = max(max_search_depth, vertex_idx + 1)

            for color in range(1, k + 1):
                colors_attempted_count += 1
                conflict_found = False
                conflicting_vertex: Optional[str] = None

                # Check conflict with neighbors
                for neighbor in adj[curr_v]:
                    if neighbor in current_coloring and current_coloring[neighbor] == color:
                        conflict_found = True
                        conflicting_vertex = neighbor
                        break

                # Record attempt
                steps.append({
                    "step_index": len(steps),
                    "action": "color_attempt",
                    "vertex": curr_v,
                    "color": color,
                    "k_colors_allowed": k,
                    "search_depth": vertex_idx + 1,
                    "partial_coloring": dict(current_coloring),
                    "conflict": conflict_found,
                    "conflicting_vertex": conflicting_vertex,
                    "conflict_reason": (
                        f"Neighbor '{conflicting_vertex}' already has color {color}"
                        if conflict_found else None
                    ),
                    "current_best_coloring": dict(final_coloring) if final_coloring else None,
                    "description": (
                        f"Attempting color {color} on vertex '{curr_v}' (allowed k={k})."
                    ),
                })

                if conflict_found:
                    conflicts_count += 1
                    steps.append({
                        "step_index": len(steps),
                        "action": "conflict",
                        "vertex": curr_v,
                        "color": color,
                        "k_colors_allowed": k,
                        "search_depth": vertex_idx + 1,
                        "partial_coloring": dict(current_coloring),
                        "conflict": True,
                        "conflicting_vertex": conflicting_vertex,
                        "conflict_reason": f"Neighbor '{conflicting_vertex}' already colored {color}",
                        "current_best_coloring": dict(final_coloring) if final_coloring else None,
                        "description": (
                            f"Conflict! Vertex '{curr_v}' cannot take color {color} because adjacent '{conflicting_vertex}' has color {color}."
                        ),
                    })
                    continue

                # No conflict: assign color
                current_coloring[curr_v] = color
                steps.append({
                    "step_index": len(steps),
                    "action": "assigned",
                    "vertex": curr_v,
                    "color": color,
                    "k_colors_allowed": k,
                    "search_depth": vertex_idx + 1,
                    "partial_coloring": dict(current_coloring),
                    "conflict": False,
                    "conflicting_vertex": None,
                    "conflict_reason": None,
                    "current_best_coloring": dict(final_coloring) if final_coloring else None,
                    "description": f"Assigned color {color} to vertex '{curr_v}'. Proceeding to next vertex.",
                })

                if backtrack(vertex_idx + 1):
                    return True

                # Backtrack
                backtracks_count += 1
                del current_coloring[curr_v]
                steps.append({
                    "step_index": len(steps),
                    "action": "backtrack",
                    "vertex": curr_v,
                    "color": color,
                    "k_colors_allowed": k,
                    "search_depth": vertex_idx + 1,
                    "partial_coloring": dict(current_coloring),
                    "conflict": False,
                    "conflicting_vertex": None,
                    "conflict_reason": None,
                    "current_best_coloring": dict(final_coloring) if final_coloring else None,
                    "description": f"Backtracking from vertex '{curr_v}' (removed color {color}). Trying next color choice.",
                })

            return False

        if backtrack(0):
            is_colorable = True
            final_coloring = dict(current_coloring)
            chromatic_number = k
            steps.append({
                "step_index": len(steps),
                "action": "solution_found",
                "vertex": clean_vertices[-1],
                "color": final_coloring[clean_vertices[-1]],
                "k_colors_allowed": k,
                "search_depth": len(clean_vertices),
                "partial_coloring": dict(final_coloring),
                "conflict": False,
                "conflicting_vertex": None,
                "conflict_reason": None,
                "current_best_coloring": dict(final_coloring),
                "description": (
                    f"Valid {k}-coloring found! All {len(clean_vertices)} vertices successfully colored without conflicts. Chromatic number: {k}."
                ),
            })
            break

    metrics = {
        "vertices_count": len(clean_vertices),
        "edges_count": len(clean_edges),
        "colors_attempted": colors_attempted_count,
        "conflicts_detected": conflicts_count,
        "backtracks_performed": backtracks_count,
        "chromatic_number": chromatic_number if chromatic_number is not None else -1,
        "max_search_depth": max_search_depth,
        "is_colorable": is_colorable,
    }

    return {
        "steps": steps,
        "final_coloring": final_coloring or {},
        "chromatic_number": chromatic_number or -1,
        "is_colorable": is_colorable,
        "vertices": clean_vertices,
        "edges": clean_edges,
        "metrics": metrics,
    }
