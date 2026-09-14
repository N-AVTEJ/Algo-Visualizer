"""Automated test suite for Modules 2, 3, and 4 algorithms and API endpoints."""
import math
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from fastapi.testclient import TestClient
from app.main import app
from app.algorithms.module2.merge_sort import run_merge_sort
from app.algorithms.module2.quick_sort import run_quick_sort
from app.algorithms.module3.n_queens import run_n_queens
from app.algorithms.module4.floyd_warshall import run_floyd_warshall, get_default_graph

client = TestClient(app)


# ============================================================================
# MODULE 2 TESTS: Divide & Conquer (Merge Sort & Quick Sort)
# ============================================================================

def test_merge_sort_logic():
    # 1. Standard unsorted
    arr = [38, 27, 43, 3, 9, 82, 10]
    res = run_merge_sort(arr)
    assert res["result_array"] == sorted(arr)
    assert res["comparisons"] > 0
    assert len(res["steps"]) > 0

    actions = {s["action"] for s in res["steps"]}
    assert "split" in actions
    assert "merge_compare" in actions
    assert "merge_place" in actions
    assert "merged" in actions

    # 2. Empty array
    empty_res = run_merge_sort([])
    assert empty_res["result_array"] == []
    assert empty_res["comparisons"] == 0
    assert len(empty_res["steps"]) == 0

    # 3. Single element
    single_res = run_merge_sort([42])
    assert single_res["result_array"] == [42]
    assert single_res["comparisons"] == 0

    # 4. Duplicates and negative values
    dup_neg = [5, -2, 10, -2, 0, 5, -8]
    dup_res = run_merge_sort(dup_neg)
    assert dup_res["result_array"] == sorted(dup_neg)


def test_quick_sort_logic():
    # 1. Standard unsorted
    arr = [38, 27, 43, 3, 9, 82, 10]
    res = run_quick_sort(arr)
    assert res["result_array"] == sorted(arr)
    assert res["comparisons"] > 0
    assert len(res["steps"]) > 0

    actions = {s["action"] for s in res["steps"]}
    assert "pivot_select" in actions
    assert "compare" in actions
    assert "partition_end" in actions

    # 2. Empty array
    empty_res = run_quick_sort([])
    assert empty_res["result_array"] == []
    assert empty_res["comparisons"] == 0
    assert len(empty_res["steps"]) == 0

    # 3. Single element
    single_res = run_quick_sort([99])
    assert single_res["result_array"] == [99]

    # 4. Duplicates and negative values
    dup_neg = [12, -4, 0, 12, -10, 8, -4]
    dup_res = run_quick_sort(dup_neg)
    assert dup_res["result_array"] == sorted(dup_neg)


def test_module2_api():
    # Merge sort endpoint
    resp1 = client.post(
        "/api/algorithms/module2/run",
        json={"array": [8, 3, 5, 1, 9], "algorithm": "merge_sort"},
    )
    assert resp1.status_code == 200, resp1.text
    data1 = resp1.json()
    assert data1["result_array"] == [1, 3, 5, 8, 9]
    assert "steps" in data1
    assert data1["comparisons"] > 0

    # Quick sort endpoint
    resp2 = client.post(
        "/api/algorithms/module2/run",
        json={"array": [8, 3, 5, 1, 9], "algorithm": "quick_sort"},
    )
    assert resp2.status_code == 200, resp2.text
    data2 = resp2.json()
    assert data2["result_array"] == [1, 3, 5, 8, 9]
    assert "steps" in data2
    assert "swaps" in data2


# ============================================================================
# MODULE 3 TESTS: Backtracking (N-Queens)
# ============================================================================

def test_n_queens_logic():
    # 1. 8-Queens first solution
    res = run_n_queens(n=8, stop_at_first_solution=True)
    assert res["n"] == 8
    assert res["total_solutions"] >= 1
    sol = res["solutions"][0]
    assert len(sol) == 8

    # Verify no queen attacks another in the solution
    for r1 in range(8):
        c1 = sol[r1]
        for r2 in range(r1 + 1, 8):
            c2 = sol[r2]
            assert c1 != c2, f"Same column conflict: ({r1}, {c1}) and ({r2}, {c2})"
            assert abs(r1 - r2) != abs(c1 - c2), f"Diagonal conflict: ({r1}, {c1}) and ({r2}, {c2})"

    # Verify step trace contains real search events
    actions = {s["action"] for s in res["steps"]}
    assert "place" in actions
    assert "conflict" in actions
    assert "backtrack" in actions
    assert "solution" in actions

    # Verify metrics
    metrics = res["metrics"]
    assert metrics["attempts"] > 0
    assert metrics["placements"] > 0
    assert metrics["backtracks"] > 0

    # 2. 4-Queens test
    res4 = run_n_queens(n=4, stop_at_first_solution=True)
    assert res4["n"] == 4
    assert res4["total_solutions"] == 1


def test_module3_api():
    resp = client.post(
        "/api/algorithms/module3/run",
        json={"n": 8, "stop_at_first_solution": True},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["n"] == 8
    assert len(data["solutions"]) >= 1
    assert len(data["steps"]) > 0

    # Invalid n validation (< 4 or > 10)
    bad_resp = client.post(
        "/api/algorithms/module3/run",
        json={"n": 2, "stop_at_first_solution": True},
    )
    assert bad_resp.status_code == 422


# ============================================================================
# MODULE 4 TESTS: Dynamic Programming (Floyd-Warshall)
# ============================================================================

def test_floyd_warshall_logic():
    default_data = get_default_graph()
    res = run_floyd_warshall(default_data["matrix"], default_data["labels"])

    assert len(res["steps"]) > 0
    # For a 4-node graph, 1 init + 64 relaxations + 1 completed = 66 steps
    assert len(res["steps"]) == 66

    final_matrix = res["final_matrix"]
    # Check shortest path from A (0) to D (3):
    # A -> B (5), B -> C (3), C -> D (1) => Total = 9 (shorter than direct edge 10)
    assert final_matrix[0][3] == 9
    assert final_matrix[0][1] == 5
    assert final_matrix[1][3] == 4  # B -> C (3) + C -> D (1) = 4
    assert final_matrix[3][0] is None  # D has no outgoing edges -> None (infinity)

    # Check step structure
    relax_steps = [s for s in res["steps"] if s["action"] == "relax"]
    assert len(relax_steps) == 64
    for s in relax_steps:
        assert "k" in s
        assert "i" in s
        assert "j" in s
        assert "updated" in s
        assert "matrix" in s


def test_module4_api():
    resp = client.post(
        "/api/algorithms/module4/run",
        json={},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "steps" in data
    assert "final_matrix" in data
    assert data["final_matrix"][0][3] == 9


if __name__ == "__main__":
    print("Running Module 2 tests...")
    test_merge_sort_logic()
    test_quick_sort_logic()
    test_module2_api()
    print("✓ Module 2 tests passed.")

    print("Running Module 3 tests...")
    test_n_queens_logic()
    test_module3_api()
    print("✓ Module 3 tests passed.")

    print("Running Module 4 tests...")
    test_floyd_warshall_logic()
    test_module4_api()
    print("✓ Module 4 tests passed.")

    print("\nALL MODULES 2-4 TESTS PASSED SUCCESSFULLY!")
