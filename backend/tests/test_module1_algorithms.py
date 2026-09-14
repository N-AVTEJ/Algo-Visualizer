"""Automated test suite for Module 1 algorithms and API endpoints."""
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.algorithms.module1.linear_search import run_linear_search
from app.algorithms.module1.binary_search import run_binary_search, is_sorted
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_linear_search_cases():
    print("\n--- Testing Linear Search ---")
    arr = [10, 20, 30, 40, 50]

    # 1. First element
    r1 = run_linear_search(arr, 10)
    assert r1["result_index"] == 0, f"Expected 0, got {r1['result_index']}"
    assert r1["comparisons"] == 1, f"Expected 1 comparison, got {r1['comparisons']}"
    assert len(r1["steps"]) == 1
    assert r1["steps"][0]["found"] is True
    assert r1["steps"][0]["comparisons"] == 1

    # 2. Middle element
    r2 = run_linear_search(arr, 30)
    assert r2["result_index"] == 2
    assert r2["comparisons"] == 3
    assert len(r2["steps"]) == 3
    assert r2["steps"][2]["found"] is True
    assert r2["steps"][2]["comparisons"] == 3

    # 3. Last element
    r3 = run_linear_search(arr, 50)
    assert r3["result_index"] == 4
    assert r3["comparisons"] == 5
    assert len(r3["steps"]) == 5
    assert r3["steps"][4]["found"] is True

    # 4. Absent element
    r4 = run_linear_search(arr, 99)
    assert r4["result_index"] == -1
    assert r4["comparisons"] == 5
    assert len(r4["steps"]) == 5
    assert all(s["found"] is False for s in r4["steps"])

    # 5. Single element array - found & absent
    r5a = run_linear_search([42], 42)
    assert r5a["result_index"] == 0
    assert r5a["comparisons"] == 1
    assert r5a["steps"][0]["found"] is True

    r5b = run_linear_search([42], 7)
    assert r5b["result_index"] == -1
    assert r5b["comparisons"] == 1
    assert r5b["steps"][0]["found"] is False

    # 6. Empty array
    r6 = run_linear_search([], 10)
    assert r6["result_index"] == -1
    assert r6["comparisons"] == 0
    assert len(r6["steps"]) == 0

    print("[PASS] Linear search tests passed.")


def test_binary_search_cases():
    print("\n--- Testing Binary Search ---")
    arr = [10, 20, 30, 40, 50, 60, 70]

    # 1. Target found in middle
    r1 = run_binary_search(arr, 40)
    assert r1["result_index"] == 3
    assert r1["comparisons"] == 1
    assert r1["steps"][0]["found"] is True
    assert r1["steps"][0]["mid"] == 3

    # 2. Target found at left boundary (first element)
    r2 = run_binary_search(arr, 10)
    assert r2["result_index"] == 0
    assert r2["steps"][-1]["found"] is True
    assert r2["steps"][-1]["index"] == 0

    # 3. Target found at right boundary (last element)
    r3 = run_binary_search(arr, 70)
    assert r3["result_index"] == 6
    assert r3["steps"][-1]["found"] is True
    assert r3["steps"][-1]["index"] == 6

    # 4. Target absent
    r4a = run_binary_search(arr, 5)  # smaller than min
    assert r4a["result_index"] == -1
    assert all(s["found"] is False for s in r4a["steps"])

    r4b = run_binary_search(arr, 95)  # larger than max
    assert r4b["result_index"] == -1
    assert all(s["found"] is False for s in r4b["steps"])

    r4c = run_binary_search(arr, 35)  # between elements
    assert r4c["result_index"] == -1
    assert all(s["found"] is False for s in r4c["steps"])

    # 5. Single element array
    r5a = run_binary_search([100], 100)
    assert r5a["result_index"] == 0
    assert r5a["comparisons"] == 1
    assert r5a["steps"][0]["found"] is True

    r5b = run_binary_search([100], 50)
    assert r5b["result_index"] == -1
    assert r5b["comparisons"] == 1
    assert r5b["steps"][0]["found"] is False

    # 6. Empty array
    r6 = run_binary_search([], 10)
    assert r6["result_index"] == -1
    assert r6["comparisons"] == 0
    assert len(r6["steps"]) == 0

    # 7. Trace correctness: cumulative comparisons
    r7 = run_binary_search(arr, 20)
    for idx, step in enumerate(r7["steps"]):
        assert step["comparisons"] == idx + 1
        assert "left" in step
        assert "right" in step
        assert "mid" in step
    assert r7["comparisons"] == len(r7["steps"])

    # 8. Unsorted input raises ValueError
    try:
        run_binary_search([50, 20, 10], 20)
        assert False, "Should have raised ValueError on unsorted array"
    except ValueError as e:
        assert "Binary search requires a sorted array" in str(e)

    print("[PASS] Binary search tests passed.")


def test_api_module1_endpoint():
    print("\n--- Testing POST /api/algorithms/module1/run ---")

    # 1. Linear search via API
    res_linear = client.post(
        "/api/algorithms/module1/run",
        json={"array": [10, 20, 30, 40, 50], "target": 30, "algorithm": "linear"},
    )
    assert res_linear.status_code == 200, f"Expected 200, got {res_linear.status_code}: {res_linear.text}"
    data_l = res_linear.json()
    assert data_l["result_index"] == 2
    assert data_l["comparisons"] == 3
    assert len(data_l["steps"]) == 3

    # 2. Binary search via API
    res_binary = client.post(
        "/api/algorithms/module1/run",
        json={"array": [10, 20, 30, 40, 50], "target": 40, "algorithm": "binary"},
    )
    assert res_binary.status_code == 200, f"Expected 200, got {res_binary.status_code}: {res_binary.text}"
    data_b = res_binary.json()
    assert data_b["result_index"] == 3
    assert len(data_b["steps"]) > 0

    # 3. Binary search unsorted array rejection (HTTP 400)
    res_unsorted = client.post(
        "/api/algorithms/module1/run",
        json={"array": [50, 10, 40], "target": 10, "algorithm": "binary"},
    )
    assert res_unsorted.status_code == 400, f"Expected 400, got {res_unsorted.status_code}"
    assert "Binary search requires a sorted array" in res_unsorted.json()["detail"]

    # 4. Invalid algorithm rejection (HTTP 422)
    res_invalid_algo = client.post(
        "/api/algorithms/module1/run",
        json={"array": [10, 20], "target": 10, "algorithm": "bubble_sort"},
    )
    assert res_invalid_algo.status_code == 422, f"Expected 422, got {res_invalid_algo.status_code}"

    print("[PASS] POST /api/algorithms/module1/run endpoint tests passed.")


if __name__ == "__main__":
    test_linear_search_cases()
    test_binary_search_cases()
    test_api_module1_endpoint()
    print("\nALL MODULE 1 BACKEND TESTS PASSED SUCCESSFULLY!")
