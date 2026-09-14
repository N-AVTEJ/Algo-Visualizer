"""Automated test suite for Modules 8, 9, and 10 algorithms and API endpoints."""
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from fastapi.testclient import TestClient
from app.main import app
from app.algorithms.module8.branch_bound import run_branch_bound, get_default_branch_bound_data, compute_upper_bound
from app.algorithms.module9.sat_solver import run_sat_solver, get_default_sat_data
from app.algorithms.module10.graph_coloring import run_graph_coloring, get_default_graph_coloring_data

client = TestClient(app)


# ============================================================================
# MODULE 8 TESTS: 0/1 Knapsack Branch & Bound
# ============================================================================

def test_branch_bound_logic():
    # Standard knapsack problem instance
    items = [
        {"id": "A", "weight": 2, "value": 40},
        {"id": "B", "weight": 3.14 if False else 3, "value": 50},
        {"id": "C", "weight": 1, "value": 100},
        {"id": "D", "weight": 5, "value": 95},
        {"id": "E", "weight": 3, "value": 30},
    ]
    capacity = 10

    res = run_branch_bound(items, capacity)

    # Optimum check
    assert res["optimal_value"] > 0
    assert res["final_weight"] <= capacity
    assert len(res["selected_items"]) > 0

    # For these items:
    # C: wt 1, val 100 (ratio 100)
    # A: wt 2, val 40 (ratio 20)
    # D: wt 5, val 95 (ratio 19)
    # B: wt 3, val 50 (ratio 16.67)
    # E: wt 3, val 30 (ratio 10)
    # With capacity 10: C(1, 100) + A(2, 40) + D(5, 95) = wt 8, val 235.
    # Can we add B? wt 8 + 3 = 11 > 10.
    # If C + D + B = 1 + 5 + 3 = 9 wt, val 100 + 95 + 50 = 245!
    # Best: C(100) + D(95) + B(50) = 245, wt 9 <= 10.
    assert res["optimal_value"] == 245
    assert res["final_weight"] == 9
    assert set(res["selected_items"]) == {"C", "D", "B"}

    # Verify trace steps
    actions = {s["action"] for s in res["steps"]}
    assert "node_created" in actions
    assert "node_expanded" in actions
    assert "branch_pruned" in actions
    assert "best_solution_updated" in actions

    # Verify pruning reasons are explicit
    prune_steps = [s for s in res["steps"] if s["action"] == "branch_pruned"]
    assert len(prune_steps) > 0
    for ps in prune_steps:
        assert ps["prune_reason"] is not None
        assert any(keyword in ps["prune_reason"] for keyword in ["exceeds capacity", "Current Best"])

    # Verify tree nodes integrity
    tree_nodes = res["tree_nodes"]
    assert len(tree_nodes) > 0
    root = [n for n in tree_nodes if n["parent_id"] is None]
    assert len(root) == 1
    assert root[0]["depth"] == 0

    # Best node is marked
    best_nodes = [n for n in tree_nodes if n.get("is_best") is True]
    assert len(best_nodes) == 1


def test_branch_bound_validation():
    # Invalid capacity
    try:
        run_branch_bound([{"id": "1", "weight": 2, "value": 10}], capacity=0)
        assert False, "Should have raised ValueError for capacity <= 0"
    except ValueError:
        pass

    # Negative weight
    try:
        run_branch_bound([{"id": "1", "weight": -2, "value": 10}], capacity=10)
        assert False, "Should have raised ValueError for negative weight"
    except ValueError:
        pass


def test_module8_api():
    # Default run
    resp = client.post("/api/algorithms/module8/run", json={})
    assert resp.status_code == 200
    data = resp.json()
    assert "steps" in data
    assert "optimal_value" in data
    assert "tree_nodes" in data
    assert data["optimal_value"] > 0

    # Custom run
    payload = {
        "items": [
            {"id": "X1", "weight": 4, "value": 50},
            {"id": "X2", "weight": 3, "value": 40},
            {"id": "X3", "weight": 2, "value": 30},
        ],
        "capacity": 5,
    }
    resp2 = client.post("/api/algorithms/module8/run", json=payload)
    assert resp2.status_code == 200
    data2 = resp2.json()
    # wt 3 (val 40) + wt 2 (val 30) = wt 5, val 70
    assert data2["optimal_value"] == 70

    # Bad request (capacity > 100)
    bad_resp = client.post("/api/algorithms/module8/run", json={"capacity": 500})
    assert bad_resp.status_code == 422


# ============================================================================
# MODULE 9 TESTS: Brute-Force SAT Solver
# ============================================================================

def test_sat_solver_satisfiable():
    # Satisfiable formula: (x1 OR ~x2) AND (x2 OR x3)
    variables = ["x1", "x2", "x3"]
    clauses = [
        ["x1", "~x2"],
        ["x2", "x3"],
    ]

    res = run_sat_solver(variables, clauses, stop_on_first_satisfying=True)
    assert res["is_satisfiable"] is True
    assert res["satisfying_assignment"] is not None
    assert res["early_termination"] is True

    # Verify that satisfying assignment actually satisfies every clause
    assign = res["satisfying_assignment"]
    for cl in clauses:
        clause_true = False
        for lit in cl:
            if lit.startswith("~"):
                if not assign[lit[1:]]:
                    clause_true = True
            else:
                if assign[lit]:
                    clause_true = True
        assert clause_true, f"Clause {cl} failed under satisfying assignment {assign}"

    # Trace step verification
    assert len(res["steps"]) > 0
    last_step = res["steps"][-1]
    assert last_step["all_satisfied"] is True
    assert "clause_evaluations" in last_step
    assert len(last_step["clause_evaluations"]) == 2


def test_sat_solver_unsatisfiable():
    # Unsatisfiable formula: (x1) AND (~x1)
    variables = ["x1"]
    clauses = [["x1"], ["~x1"]]

    res = run_sat_solver(variables, clauses, stop_on_first_satisfying=True)
    assert res["is_satisfiable"] is False
    assert res["satisfying_assignment"] is None
    assert res["early_termination"] is False
    assert res["assignments_checked"] == 2  # 2^1 exhausted
    for s in res["steps"]:
        assert s["all_satisfied"] is False


def test_sat_solver_validation():
    # Undeclared variable reference
    try:
        run_sat_solver(["x1"], [["x1", "unknown_var"]])
        assert False, "Should raise ValueError for undeclared variable"
    except ValueError:
        pass

    # Empty variable list
    try:
        run_sat_solver([], [["x1"]])
        assert False, "Should raise ValueError for empty variables"
    except ValueError:
        pass


def test_module9_api():
    resp = client.post("/api/algorithms/module9/run", json={})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_satisfiable"] is True
    assert "steps" in data
    assert "metrics" in data
    assert data["metrics"]["variables_count"] == 3

    # Test UNSAT via API
    payload = {
        "variables": ["p"],
        "clauses": [["p"], ["~p"]],
        "stop_on_first_satisfying": True,
    }
    resp_unsat = client.post("/api/algorithms/module9/run", json=payload)
    assert resp_unsat.status_code == 200
    data_unsat = resp_unsat.json()
    assert data_unsat["is_satisfiable"] is False
    assert data_unsat["satisfying_assignment"] is None


# ============================================================================
# MODULE 10 TESTS: Graph Coloring Backtracking
# ============================================================================

def test_graph_coloring_logic():
    # Triangle K3: chromatic number = 3
    vertices = ["A", "B", "C"]
    edges = [
        {"u": "A", "v": "B"},
        {"u": "B", "v": "C"},
        {"u": "C", "v": "A"},
    ]

    res = run_graph_coloring(vertices, edges, max_colors=None)
    assert res["is_colorable"] is True
    assert res["chromatic_number"] == 3

    coloring = res["final_coloring"]
    assert len(coloring) == 3
    # Adjacent vertices must have different colors
    for e in edges:
        assert coloring[e["u"]] != coloring[e["v"]]

    # Verify trace steps and actions
    actions = {s["action"] for s in res["steps"]}
    assert "color_attempt" in actions
    assert "conflict" in actions
    assert "assigned" in actions
    assert "backtrack" in actions
    assert "solution_found" in actions

    # Verify conflict captures conflicting neighbor
    conflicts = [s for s in res["steps"] if s["action"] == "conflict"]
    assert len(conflicts) > 0
    for c in conflicts:
        assert c["conflicting_vertex"] is not None
        assert "Neighbor" in c["conflict_reason"]


def test_graph_coloring_bipartite():
    # 4-cycle bipartite graph: chromatic number = 2
    vertices = ["1", "2", "3", "4"]
    edges = [
        {"u": "1", "v": "2"},
        {"u": "2", "v": "3"},
        {"u": "3", "v": "4"},
        {"u": "4", "v": "1"},
    ]
    res = run_graph_coloring(vertices, edges, max_colors=None)
    assert res["is_colorable"] is True
    assert res["chromatic_number"] == 2
    coloring = res["final_coloring"]
    for e in edges:
        assert coloring[e["u"]] != coloring[e["v"]]


def test_graph_coloring_validation():
    # Self-loop
    try:
        run_graph_coloring(["A"], [{"u": "A", "v": "A"}])
        assert False, "Should raise ValueError for self-loop"
    except ValueError:
        pass

    # Unknown vertex in edge
    try:
        run_graph_coloring(["A", "B"], [{"u": "A", "v": "Z"}])
        assert False, "Should raise ValueError for unknown vertex"
    except ValueError:
        pass


def test_module10_api():
    resp = client.post("/api/algorithms/module10/run", json={})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_colorable"] is True
    assert data["chromatic_number"] >= 1
    assert "steps" in data
    assert "final_coloring" in data
    assert "metrics" in data

    # Verify adjacent colors differ
    coloring = data["final_coloring"]
    for e in data["edges"]:
        assert coloring[e["u"]] != coloring[e["v"]]


if __name__ == "__main__":
    print("Running Module 8-10 Algorithm Tests...")
    test_branch_bound_logic()
    test_branch_bound_validation()
    test_module8_api()
    print("[PASS] Module 8 Branch & Bound Tests Passed.")

    test_sat_solver_satisfiable()
    test_sat_solver_unsatisfiable()
    test_sat_solver_validation()
    test_module9_api()
    print("[PASS] Module 9 SAT Solver Tests Passed.")

    test_graph_coloring_logic()
    test_graph_coloring_bipartite()
    test_graph_coloring_validation()
    test_module10_api()
    print("[PASS] Module 10 Graph Coloring Tests Passed.")
    print("[ALL PASS] All Module 8-10 tests executed successfully!")
