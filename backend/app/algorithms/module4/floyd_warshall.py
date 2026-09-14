"""Floyd-Warshall all-pairs shortest paths algorithm with (k, i, j) relaxation step trace."""
import copy
import math
from typing import Any, Dict, List, Optional, Union

NumberOrNone = Optional[Union[int, float]]


def get_default_graph() -> Dict[str, Any]:
    """Return a standard 4-node directed weighted graph suitable for visualization."""
    labels = ["A", "B", "C", "D"]
    # None denotes infinity (no direct edge)
    matrix: List[List[NumberOrNone]] = [
        [0, 5, None, 10],
        [None, 0, 3, None],
        [None, None, 0, 1],
        [None, None, None, 0],
    ]
    return {"labels": labels, "matrix": matrix}


def run_floyd_warshall(
    matrix: Optional[List[List[NumberOrNone]]] = None,
    labels: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Execute Floyd-Warshall and generate a comprehensive relaxation step trace.

    Args:
        matrix: V x V adjacency matrix where None denotes infinity
        labels: Optional node labels (defaults to 0..V-1 or A, B, C...)

    Returns:
        Dict containing:
            - steps: Chronological trace for every (k, i, j) triple
            - initial_matrix: Starting distance matrix
            - final_matrix: Final all-pairs shortest distances
            - labels: Vertex labels
            - metrics: Summary relaxation counts
    """
    if matrix is None:
        default_data = get_default_graph()
        matrix = default_data["matrix"]
        labels = default_data["labels"]

    v = len(matrix)
    if v < 2 or v > 8:
        raise ValueError("Graph dimension V must be between 2 and 8 vertices.")

    for row in matrix:
        if len(row) != v:
            raise ValueError("Distance matrix must be square (V x V).")

    if labels is None or len(labels) != v:
        # Default labels: A, B, C, D... or V0, V1...
        alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        labels = [alphabet[i] if i < len(alphabet) else f"V{i}" for i in range(v)]

    # Convert None to math.inf for internal calculations
    dist: List[List[float]] = []
    for r in range(v):
        row_floats: List[float] = []
        for c in range(v):
            val = matrix[r][c]
            if val is None:
                row_floats.append(math.inf)
            else:
                row_floats.append(float(val))
        dist.append(row_floats)

    def serialize_matrix(d_mat: List[List[float]]) -> List[List[NumberOrNone]]:
        out: List[List[NumberOrNone]] = []
        for r in d_mat:
            out_row: List[NumberOrNone] = []
            for val in r:
                if math.isinf(val):
                    out_row.append(None)
                else:
                    out_row.append(int(val) if val.is_integer() else round(val, 2))
            out.append(out_row)
        return out

    steps: List[Dict[str, Any]] = []
    relaxations = 0
    updates_count = 0

    # Initial state step
    steps.append({
        "action": "init",
        "k": -1,
        "i": -1,
        "j": -1,
        "prev_dist": None,
        "dist_ik": None,
        "dist_kj": None,
        "candidate_dist": None,
        "updated": False,
        "new_dist": None,
        "matrix": serialize_matrix(dist),
        "explanation": "Initial distance matrix from graph adjacency list.",
        "metrics": {
            "relaxations": 0,
            "updates": 0,
            "current_k": 0,
        },
    })

    # Main triple loop: k (intermediate vertex), i (source), j (destination)
    for k in range(v):
        for i in range(v):
            for j in range(v):
                relaxations += 1
                prev_dist = dist[i][j]
                d_ik = dist[i][k]
                d_kj = dist[k][j]

                updated = False
                candidate_dist = math.inf
                if not math.isinf(d_ik) and not math.isinf(d_kj):
                    candidate_dist = d_ik + d_kj
                    if candidate_dist < prev_dist:
                        dist[i][j] = candidate_dist
                        updated = True
                        updates_count += 1

                # Explanation text for educational clarity
                u_lbl = labels[i]
                v_lbl = labels[j]
                k_lbl = labels[k]
                if updated:
                    exp = (
                        f"Relaxation: Path {u_lbl} -> {k_lbl} -> {v_lbl} "
                        f"({dist[i][k]} + {dist[k][j]} = {candidate_dist}) is shorter than "
                        f"previous {u_lbl} -> {v_lbl} ({'∞' if math.isinf(prev_dist) else prev_dist}). Updated!"
                    )
                else:
                    exp = (
                        f"Checking path {u_lbl} -> {k_lbl} -> {v_lbl}. "
                        f"Candidate: {candidate_dist if not math.isinf(candidate_dist) else '∞'}, "
                        f"Existing: {prev_dist if not math.isinf(prev_dist) else '∞'}. No update."
                    )

                steps.append({
                    "action": "relax",
                    "k": k,
                    "i": i,
                    "j": j,
                    "prev_dist": None if math.isinf(prev_dist) else prev_dist,
                    "dist_ik": None if math.isinf(d_ik) else d_ik,
                    "dist_kj": None if math.isinf(d_kj) else d_kj,
                    "candidate_dist": None if math.isinf(candidate_dist) else candidate_dist,
                    "updated": updated,
                    "new_dist": None if math.isinf(dist[i][j]) else dist[i][j],
                    "matrix": serialize_matrix(dist),
                    "explanation": exp,
                    "metrics": {
                        "relaxations": relaxations,
                        "updates": updates_count,
                        "current_k": k,
                    },
                })

    final_mat = serialize_matrix(dist)

    steps.append({
        "action": "completed",
        "k": v - 1,
        "i": v - 1,
        "j": v - 1,
        "prev_dist": None,
        "dist_ik": None,
        "dist_kj": None,
        "candidate_dist": None,
        "updated": False,
        "new_dist": None,
        "matrix": final_mat,
        "explanation": "Floyd-Warshall complete. All-pairs shortest path matrix computed.",
        "metrics": {
            "relaxations": relaxations,
            "updates": updates_count,
            "current_k": v - 1,
        },
    })

    return {
        "steps": steps,
        "initial_matrix": matrix,
        "final_matrix": final_mat,
        "labels": labels,
        "metrics": {
            "vertices": v,
            "total_relaxations": relaxations,
            "total_updates": updates_count,
            "total_steps": len(steps),
        },
    }
