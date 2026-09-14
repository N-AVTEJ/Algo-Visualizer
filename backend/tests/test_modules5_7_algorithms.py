"""Automated test suite for Modules 5, 6, and 7 algorithms and API endpoints."""
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from fastapi.testclient import TestClient
from app.main import app
from app.algorithms.module5.knapsack import run_knapsack, get_default_knapsack_data
from app.algorithms.module6.job_sequencing import run_job_sequencing, get_default_jobs
from app.algorithms.module7.kruskal import run_kruskal, get_default_kruskal_graph

client = TestClient(app)


# ============================================================================
# MODULE 5 TESTS: 0/1 Knapsack
# ============================================================================

def test_knapsack_logic():
    # Standard problem instance
    items = [
        {"id": "Item 1", "weight": 2, "value": 3},
        {"id": "Item 2", "weight": 3, "value": 4},
        {"id": "Item 3", "weight": 4, "value": 5},
        {"id": "Item 4", "weight": 5, "value": 6},
    ]
    capacity = 8

    res = run_knapsack(items, capacity)

    # Optimal max value for wt 3 (val 4) + wt 5 (val 6) = wt 8, val 10
    assert res["max_value"] == 10
    assert res["total_value"] == 10
    assert res["total_weight"] <= capacity
    assert res["total_weight"] == 8

    # Verify DP table properties
    table = res["dp_table"]
    assert len(table) == len(items) + 1
    assert len(table[0]) == capacity + 1
    assert table[len(items)][capacity] == 10

    # Verify step trace phases
    phases = {s["phase"] for s in res["steps"]}
    assert "init" in phases
    assert "table_fill" in phases
    assert "backtrack" in phases
    assert "completed" in phases

    # Verify backtracking selected valid items
    for item_idx in res["selected_items"]:
        assert 0 <= item_idx < len(items)


def test_module5_api():
    # 1. Successful default run
    resp = client.post("/api/algorithms/module5/run", json={})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["max_value"] == 10
    assert len(data["steps"]) > 0
    assert "dp_table" in data

    # 2. Custom knapsack
    resp_custom = client.post(
        "/api/algorithms/module5/run",
        json={
            "items": [
                {"id": "A", "weight": 1, "value": 1},
                {"id": "B", "weight": 2, "value": 6},
                {"id": "C", "weight": 3, "value": 10},
                {"id": "D", "weight": 5, "value": 16},
            ],
            "capacity": 7,
        },
    )
    assert resp_custom.status_code == 200
    custom_data = resp_custom.json()
    # Weights 2 (val 6) + 5 (val 16) = 22; or 1+3+2? 1(1)+3(10)+2(6)=17; 3(10)+5 (wt 8 > 7); wt 2(6)+5(16) = 22.
    assert custom_data["max_value"] == 22

    # 3. Invalid capacity validation
    resp_invalid = client.post(
        "/api/algorithms/module5/run",
        json={"capacity": 0},
    )
    assert resp_invalid.status_code == 422


# ============================================================================
# MODULE 6 TESTS: Job Sequencing with Deadlines
# ============================================================================

def test_job_sequencing_logic():
    jobs = [
        {"id": "J1", "deadline": 4, "profit": 70},
        {"id": "J2", "deadline": 1, "profit": 80},
        {"id": "J3", "deadline": 1, "profit": 30},
        {"id": "J4", "deadline": 2, "profit": 100},
        {"id": "J5", "deadline": 2, "profit": 20},
    ]

    res = run_job_sequencing(jobs)

    # Greedy choice selects J4 (profit 100), J2 (profit 80), J1 (profit 70) => total 250
    assert res["total_profit"] == 250
    assert len(res["scheduled_jobs"]) == 3
    assert set(res["scheduled_jobs"]) == {"J1", "J2", "J4"}

    # Verify trace actions
    actions = {s["action"] for s in res["steps"]}
    assert "init" in actions
    assert "sorted" in actions
    assert "considering" in actions
    assert "checking_slot" in actions
    assert "assigned" in actions
    assert "rejected" in actions
    assert "completed" in actions


def test_module6_api():
    # 1. Default run
    resp = client.post("/api/algorithms/module6/run", json={})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["total_profit"] == 250
    assert len(data["scheduled_jobs"]) == 3

    # 2. Single slot competition
    resp_comp = client.post(
        "/api/algorithms/module6/run",
        json={
            "jobs": [
                {"id": "Low", "deadline": 1, "profit": 10},
                {"id": "High", "deadline": 1, "profit": 90},
            ]
        },
    )
    assert resp_comp.status_code == 200
    comp_data = resp_comp.json()
    assert comp_data["total_profit"] == 90
    assert comp_data["scheduled_jobs"] == ["High"]


# ============================================================================
# MODULE 7 TESTS: Kruskal's Minimum Spanning Tree
# ============================================================================

def test_kruskal_logic():
    # Standard 6-vertex graph
    default_data = get_default_kruskal_graph()
    res = run_kruskal(default_data["vertices"], default_data["edges"])

    assert res["is_connected"] is True
    assert len(res["mst_edges"]) == 5  # V - 1 = 6 - 1 = 5
    # Expected edges in MST:
    # C-F (1), A-F (2), D-E (2), C-D (3), A-B (4) or E-F (4)
    # Weights: 1 + 2 + 2 + 3 + 4 = 12
    assert res["total_weight"] == 12

    # Verify cycle detection rejected edges
    assert len(res["rejected_edges"]) > 0

    # Verify trace steps
    actions = {s["action"] for s in res["steps"]}
    assert "init" in actions
    assert "sorted_edges" in actions
    assert "checking" in actions
    assert "added" in actions
    assert "rejected" in actions
    assert "completed" in actions


def test_kruskal_disconnected_graph():
    # Disconnected graph with 2 components: {A, B} and {C, D}
    vertices = ["A", "B", "C", "D"]
    edges = [
        {"u": "A", "v": "B", "weight": 5},
        {"u": "C", "v": "D", "weight": 7},
    ]
    res = run_kruskal(vertices, edges)
    assert res["is_connected"] is False
    assert len(res["mst_edges"]) == 2  # 2 edges for 4 vertices = disconnected forest
    assert res["total_weight"] == 12


def test_module7_api():
    # 1. Default run
    resp = client.post("/api/algorithms/module7/run", json={})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["is_connected"] is True
    assert data["total_weight"] == 12
    assert len(data["mst_edges"]) == 5

    # 2. Invalid edge references non-existent vertex
    resp_bad = client.post(
        "/api/algorithms/module7/run",
        json={
            "vertices": ["A", "B"],
            "edges": [{"u": "A", "v": "Z", "weight": 10}],
        },
    )
    assert resp_bad.status_code == 400
    assert "unknown vertex" in resp_bad.json()["detail"]


if __name__ == "__main__":
    print("Running Module 5 tests...")
    test_knapsack_logic()
    test_module5_api()
    print("[PASS] Module 5 tests passed.")

    print("Running Module 6 tests...")
    test_job_sequencing_logic()
    test_module6_api()
    print("[PASS] Module 6 tests passed.")

    print("Running Module 7 tests...")
    test_kruskal_logic()
    test_kruskal_disconnected_graph()
    test_module7_api()
    print("[PASS] Module 7 tests passed.")

    print("\nALL MODULES 5-7 TESTS PASSED SUCCESSFULLY!")
