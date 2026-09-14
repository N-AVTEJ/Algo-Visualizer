"""N-Queens backtracking algorithm with complete search tree and board step trace generation."""
from typing import Any, Dict, List, Optional


def run_n_queens(
    n: int = 8,
    stop_at_first_solution: bool = True,
    max_steps: int = 1500,
) -> Dict[str, Any]:
    """Execute N-Queens backtracking search and capture each decision step.

    Args:
        n: Board size (default 8, constrained between 4 and 10)
        stop_at_first_solution: Stop after discovering the first complete valid board
        max_steps: Safety cap on step count to prevent runaway payload sizes

    Returns:
        Dict containing:
            - steps: Chronological decision trace
            - solutions: List of complete solutions (each as list of queen column indices)
            - total_solutions: Count of solutions found
            - metrics: Summary search telemetry
    """
    if n < 4 or n > 10:
        raise ValueError("N must be between 4 and 10 for reasonable visualization scale.")

    steps: List[Dict[str, Any]] = []
    # queens[r] stores the column of the queen on row r, or -1 if unplaced
    queens: List[int] = [-1] * n
    solutions: List[List[int]] = []

    attempts = 0
    placements = 0
    backtracks = 0
    max_depth = 0

    # Initial root step
    steps.append({
        "action": "init",
        "row": 0,
        "col": -1,
        "board": list(queens),
        "depth": 0,
        "node_id": "root",
        "parent_id": None,
        "tree_status": "exploring",
        "conflict_with": None,
        "metrics": {
            "attempts": 0,
            "placements": 0,
            "backtracks": 0,
            "solutions": 0,
        },
    })

    def is_safe(r: int, c: int) -> Optional[Dict[str, Any]]:
        """Check if placing queen at (r, c) conflicts with existing queens.

        Returns conflict details if unsafe, None if safe.
        """
        for prev_r in range(r):
            prev_c = queens[prev_r]
            if prev_c == c:
                return {
                    "row": prev_r,
                    "col": prev_c,
                    "type": "column",
                    "reason": f"Column {c} already occupied by Queen at row {prev_r}",
                }
            if abs(prev_r - r) == abs(prev_c - c):
                return {
                    "row": prev_r,
                    "col": prev_c,
                    "type": "diagonal",
                    "reason": f"Diagonal conflict with Queen at ({prev_r}, {prev_c})",
                }
        return None

    def solve(row: int, parent_node_id: str) -> bool:
        nonlocal attempts, placements, backtracks, max_depth
        if row > max_depth:
            max_depth = row

        if row == n:
            sol = list(queens)
            solutions.append(sol)
            steps.append({
                "action": "solution",
                "row": row - 1,
                "col": queens[row - 1],
                "board": list(queens),
                "depth": row,
                "node_id": f"{parent_node_id}_sol{len(solutions)}",
                "parent_id": parent_node_id,
                "tree_status": "solution",
                "conflict_with": None,
                "metrics": {
                    "attempts": attempts,
                    "placements": placements,
                    "backtracks": backtracks,
                    "solutions": len(solutions),
                },
            })
            return stop_at_first_solution

        for col in range(n):
            if len(steps) >= max_steps:
                return True

            attempts += 1
            node_id = f"r{row}_c{col}"
            conflict = is_safe(row, col)

            if conflict is not None:
                # Record attempt that failed due to conflict
                steps.append({
                    "action": "conflict",
                    "row": row,
                    "col": col,
                    "board": list(queens),
                    "depth": row,
                    "node_id": node_id,
                    "parent_id": parent_node_id,
                    "tree_status": "conflict",
                    "conflict_with": conflict,
                    "metrics": {
                        "attempts": attempts,
                        "placements": placements,
                        "backtracks": backtracks,
                        "solutions": len(solutions),
                    },
                })
            else:
                # Valid placement
                queens[row] = col
                placements += 1
                steps.append({
                    "action": "place",
                    "row": row,
                    "col": col,
                    "board": list(queens),
                    "depth": row + 1,
                    "node_id": node_id,
                    "parent_id": parent_node_id,
                    "tree_status": "placed",
                    "conflict_with": None,
                    "metrics": {
                        "attempts": attempts,
                        "placements": placements,
                        "backtracks": backtracks,
                        "solutions": len(solutions),
                    },
                })

                found_stop = solve(row + 1, node_id)
                if found_stop:
                    return True

                # Backtrack
                queens[row] = -1
                backtracks += 1
                steps.append({
                    "action": "backtrack",
                    "row": row,
                    "col": col,
                    "board": list(queens),
                    "depth": row,
                    "node_id": f"{node_id}_bt",
                    "parent_id": node_id,
                    "tree_status": "backtracked",
                    "conflict_with": None,
                    "metrics": {
                        "attempts": attempts,
                        "placements": placements,
                        "backtracks": backtracks,
                        "solutions": len(solutions),
                    },
                })

        return False

    solve(0, "root")

    return {
        "steps": steps,
        "n": n,
        "solutions": solutions,
        "total_solutions": len(solutions),
        "metrics": {
            "attempts": attempts,
            "placements": placements,
            "backtracks": backtracks,
            "solutions": len(solutions),
            "max_depth": max_depth,
            "total_steps": len(steps),
        },
    }
