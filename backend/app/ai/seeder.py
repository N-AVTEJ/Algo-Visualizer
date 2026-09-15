"""Knowledge-base seeder for AlgoLens Pro AI Assistant.

Run once (or re-run safely) to populate the ``knowledge_base`` table with
curriculum content covering all 10 modules.  Each chunk is embedded with
``text-embedding-3-small`` and stored alongside its raw JSON representation.

Usage:
    cd backend
    python -m app.ai.seeder

Re-runs are idempotent: existing rows with the same topic are deleted and
replaced so the content stays fresh when curriculum text is updated.
"""
from __future__ import annotations

import json
import sys
import time

from app.ai.embeddings import get_embedding
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.knowledge_base import KnowledgeBase

# ---------------------------------------------------------------------------
# Curriculum knowledge corpus — all 10 modules
# ---------------------------------------------------------------------------

KNOWLEDGE_CHUNKS: list[dict[str, str]] = [
    # ------------------------------------------------------------------
    # Module 1 — Algorithm Analysis & Searching
    # ------------------------------------------------------------------
    {
        "topic": "algorithm_analysis",
        "content": (
            "Algorithm Analysis measures the efficiency of algorithms using Big-O notation. "
            "Time complexity describes how runtime grows with input size n. "
            "Space complexity describes memory usage. "
            "Common complexities from fastest to slowest: O(1) constant, O(log n) logarithmic, "
            "O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2ⁿ) exponential. "
            "Best-case, average-case, and worst-case analysis capture different scenarios."
        ),
    },
    {
        "topic": "linear_search",
        "content": (
            "Linear Search scans every element sequentially from left to right until the target "
            "is found or the array is exhausted. "
            "Time complexity: O(n) worst-case and average-case, O(1) best-case. "
            "Space complexity: O(1) — no extra memory required. "
            "Works on unsorted and sorted arrays. Simple but inefficient for large datasets."
        ),
    },
    {
        "topic": "binary_search",
        "content": (
            "Binary Search repeatedly halves the search space by comparing the target against "
            "the middle element of a sorted array. "
            "If target < mid, search the left half; if target > mid, search the right half; "
            "if equal, the target is found. "
            "Time complexity: O(log n) — each step eliminates half the remaining elements. "
            "Space complexity: O(1) iterative, O(log n) recursive. "
            "Requires a sorted input array."
        ),
    },
    # ------------------------------------------------------------------
    # Module 2 — Divide & Conquer
    # ------------------------------------------------------------------
    {
        "topic": "divide_and_conquer",
        "content": (
            "Divide and Conquer splits a problem into smaller subproblems, solves them "
            "recursively, and combines the results. "
            "Key algorithms: Merge Sort, Quick Sort, Binary Search, Strassen's Matrix Multiplication. "
            "The Master Theorem analyzes recurrences of the form T(n) = aT(n/b) + f(n)."
        ),
    },
    {
        "topic": "merge_sort",
        "content": (
            "Merge Sort divides the array in half recursively until single elements remain, "
            "then merges sorted halves back together. "
            "Time complexity: O(n log n) in all cases — best, average, and worst. "
            "Space complexity: O(n) auxiliary for the merge step. "
            "Stable sort — preserves relative order of equal elements. "
            "Recurrence: T(n) = 2T(n/2) + O(n), solved by Master Theorem to O(n log n)."
        ),
    },
    {
        "topic": "quick_sort",
        "content": (
            "Quick Sort selects a pivot, partitions the array so all elements less than the "
            "pivot are to its left and all greater are to its right, then recursively sorts "
            "both partitions. "
            "Time complexity: O(n log n) average-case, O(n²) worst-case (sorted input with "
            "bad pivot). O(log n) average space for recursion stack. "
            "In-place, cache-friendly; typically faster than Merge Sort in practice. "
            "Randomized pivot selection reduces worst-case probability."
        ),
    },
    # ------------------------------------------------------------------
    # Module 3 — Backtracking
    # ------------------------------------------------------------------
    {
        "topic": "backtracking",
        "content": (
            "Backtracking systematically explores all candidate solutions by incrementally "
            "building candidates and abandoning (pruning) those that cannot lead to a valid "
            "solution. "
            "Used for constraint satisfaction: N-Queens, Sudoku, Subset Sum, Graph Coloring. "
            "Time complexity depends on the branching factor and depth of the search tree."
        ),
    },
    {
        "topic": "n_queens",
        "content": (
            "The N-Queens problem places N chess queens on an N×N board so no two queens "
            "threaten each other (no shared row, column, or diagonal). "
            "Solved by backtracking: place a queen column by column, checking constraints. "
            "If no valid row exists for the current column, backtrack to the previous column. "
            "Time complexity: O(N!) worst-case. "
            "For N=8 there are 92 distinct solutions."
        ),
    },
    # ------------------------------------------------------------------
    # Module 4 — Dynamic Programming I
    # ------------------------------------------------------------------
    {
        "topic": "floyd_warshall",
        "content": (
            "Floyd-Warshall finds shortest paths between all pairs of vertices in a weighted "
            "graph (including negative edges, but not negative cycles). "
            "For each intermediate vertex k, it checks whether routing through k improves "
            "the path from i to j: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]). "
            "Time complexity: O(V³). Space complexity: O(V²). "
            "Returns -1 (or infinity) if no path exists."
        ),
    },
    {
        "topic": "dynamic_programming",
        "content": (
            "Dynamic Programming (DP) breaks a problem into overlapping subproblems, solves "
            "each subproblem once, and stores results (memoization or tabulation). "
            "Applicable when the problem has optimal substructure and overlapping subproblems. "
            "Top-down (memoization) uses recursion + cache; "
            "Bottom-up (tabulation) iteratively fills a table. "
            "Key examples: Fibonacci, Knapsack, Longest Common Subsequence, Floyd-Warshall."
        ),
    },
    # ------------------------------------------------------------------
    # Module 5 — Dynamic Programming II: 0/1 Knapsack
    # ------------------------------------------------------------------
    {
        "topic": "knapsack",
        "content": (
            "The 0/1 Knapsack problem: given N items each with a weight and a value, and a "
            "knapsack of capacity W, maximise total value without exceeding capacity. "
            "Each item is either included (1) or excluded (0) — fractional amounts disallowed. "
            "DP table: dp[i][w] = max value using first i items with capacity w. "
            "Recurrence: dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i]). "
            "Time complexity: O(N·W). Space complexity: O(N·W), optimisable to O(W). "
            "Backtrack through the DP table to identify which items were selected."
        ),
    },
    # ------------------------------------------------------------------
    # Module 6 — Greedy Algorithms
    # ------------------------------------------------------------------
    {
        "topic": "greedy_algorithms",
        "content": (
            "Greedy algorithms make the locally optimal choice at each step, hoping to find a "
            "global optimum. They do not backtrack. "
            "Correct for problems with the greedy-choice property and optimal substructure. "
            "Examples: Activity Selection, Job Sequencing with Deadlines, Huffman Coding, "
            "Kruskal's MST, Dijkstra's shortest path (non-negative weights only)."
        ),
    },
    {
        "topic": "job_sequencing",
        "content": (
            "Job Sequencing with Deadlines: schedule jobs to maximise total profit. "
            "Each job has a deadline and a profit; only one job can run per time slot; "
            "each job takes exactly one unit of time. "
            "Greedy approach: sort jobs by profit descending, then schedule each job in the "
            "latest available slot before its deadline. "
            "Time complexity: O(n²) with linear slot search, O(n log n) with DSU optimisation. "
            "Guaranteed to find the optimal schedule."
        ),
    },
    # ------------------------------------------------------------------
    # Module 7 — Graph Algorithms
    # ------------------------------------------------------------------
    {
        "topic": "kruskal_mst",
        "content": (
            "Kruskal's algorithm finds a Minimum Spanning Tree (MST) by sorting all edges by "
            "weight and greedily adding the cheapest edge that does not form a cycle. "
            "Uses a Disjoint Set Union (DSU / Union-Find) data structure to detect cycles "
            "in O(α(V)) per operation (nearly O(1) with path compression + union by rank). "
            "Time complexity: O(E log E) dominated by edge sorting. "
            "Result: a spanning tree of V-1 edges with minimum total weight."
        ),
    },
    {
        "topic": "graph_theory",
        "content": (
            "A graph G = (V, E) consists of vertices V and edges E. "
            "Undirected graphs have bidirectional edges; directed graphs (digraphs) have "
            "one-way edges. Weighted graphs assign a cost to each edge. "
            "Key representations: adjacency matrix O(V²) space, adjacency list O(V+E) space. "
            "Key traversal algorithms: BFS (shortest path in unweighted graphs) O(V+E), "
            "DFS (cycle detection, topological sort) O(V+E)."
        ),
    },
    # ------------------------------------------------------------------
    # Module 8 — Branch & Bound
    # ------------------------------------------------------------------
    {
        "topic": "branch_and_bound",
        "content": (
            "Branch and Bound is a systematic method for combinatorial optimisation. "
            "It explores a state-space tree, branching on decisions (include/exclude an item) "
            "and bounding each node with an upper-bound estimate of the best reachable solution. "
            "Nodes whose bound does not exceed the current best solution are pruned. "
            "Applied to 0/1 Knapsack, Travelling Salesman Problem, Integer Programming. "
            "Best-first search (priority queue on bound) outperforms BFS/DFS in practice. "
            "Worst-case exponential, but pruning makes it far faster than brute-force."
        ),
    },
    {
        "topic": "branch_bound_knapsack",
        "content": (
            "Branch & Bound for 0/1 Knapsack: sort items by value/weight ratio descending. "
            "Each node represents a decision to include or exclude an item. "
            "Upper bound at each node: current value + fractional fill of remaining capacity "
            "(relaxed LP bound). "
            "If upper_bound <= best_value so far, prune the node. "
            "Explore include-branch first (greedily optimistic). "
            "Finds the optimal integer solution more efficiently than pure backtracking."
        ),
    },
    # ------------------------------------------------------------------
    # Module 9 — NP-Completeness & SAT
    # ------------------------------------------------------------------
    {
        "topic": "np_completeness",
        "content": (
            "P: problems solvable in polynomial time. "
            "NP: problems whose solutions can be verified in polynomial time. "
            "NP-Complete: hardest problems in NP; every NP problem reduces to them in poly time. "
            "NP-Hard: at least as hard as NP-Complete, but not necessarily in NP. "
            "P vs NP is the most famous open problem in computer science. "
            "Key NP-Complete problems: SAT, 3-SAT, Vertex Cover, Hamiltonian Cycle, "
            "Travelling Salesman (decision), Graph Coloring (k≥3), 0/1 Knapsack."
        ),
    },
    {
        "topic": "sat_solver",
        "content": (
            "Boolean Satisfiability (SAT): given a CNF formula (conjunction of clauses, "
            "each clause a disjunction of literals), determine if there is an assignment of "
            "True/False to variables that satisfies all clauses. "
            "SAT was the first problem proven NP-Complete (Cook–Levin theorem, 1971). "
            "Brute-force: enumerate all 2ⁿ assignments, evaluate each clause set. "
            "Time complexity: O(2ⁿ · m) where n = variables, m = clauses. "
            "DPLL and CDCL algorithms make modern SAT solvers highly practical."
        ),
    },
    # ------------------------------------------------------------------
    # Module 10 — Graph Coloring
    # ------------------------------------------------------------------
    {
        "topic": "graph_coloring",
        "content": (
            "Graph Coloring assigns colors to vertices so no two adjacent vertices share a color. "
            "The chromatic number χ(G) is the minimum number of colors required. "
            "k-colorability for k≥3 is NP-Complete. "
            "Applications: register allocation in compilers, scheduling, map coloring. "
            "Backtracking algorithm: assign color 1..k to each vertex; if a conflict occurs, "
            "try the next color; if all colors exhausted, backtrack. "
            "The Four Color Theorem guarantees χ(G) ≤ 4 for any planar graph."
        ),
    },
    {
        "topic": "chromatic_number",
        "content": (
            "The chromatic number χ(G) is the smallest k such that G is k-colorable. "
            "χ(G) = 1 iff G has no edges (empty graph). "
            "χ(G) = 2 iff G is bipartite (contains no odd cycles). "
            "χ(G) ≥ ω(G) where ω(G) is the clique number (max complete subgraph). "
            "Computing χ(G) exactly is NP-Hard; greedy heuristics give upper bounds. "
            "Greedy coloring gives at most Δ(G)+1 colors, where Δ(G) is max vertex degree."
        ),
    },
]


# ---------------------------------------------------------------------------
# Seeder entry point
# ---------------------------------------------------------------------------

def seed() -> None:
    """Embed all knowledge chunks and insert them into the database."""
    if not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY:
        print(
            "[seeder] ERROR: GEMINI_API_KEY (or OPENAI_API_KEY) is not set in backend/.env. "
            "Cannot embed curriculum content.",
            file=sys.stderr,
        )
        sys.exit(1)

    db = SessionLocal()
    try:
        print(f"[seeder] Seeding {len(KNOWLEDGE_CHUNKS)} knowledge chunks …")

        for i, chunk in enumerate(KNOWLEDGE_CHUNKS, start=1):
            topic = chunk["topic"]
            content = chunk["content"]

            # Remove existing rows for this topic so re-runs are idempotent.
            existing = db.query(KnowledgeBase).filter(KnowledgeBase.topic == topic).all()
            for row in existing:
                db.delete(row)

            # Embed the content text.
            print(f"  [{i}/{len(KNOWLEDGE_CHUNKS)}] Embedding '{topic}' …", end="", flush=True)
            embedding = get_embedding(content)
            embedding_json = json.dumps(embedding)

            # Persist the row.
            row = KnowledgeBase(
                topic=topic,
                content=content,
                embedding_json=embedding_json,
            )
            db.add(row)
            db.flush()  # get the id so we can update the vector column

            # Update the native vector column on Postgres.
            try:
                vec_literal = "[" + ",".join(str(v) for v in embedding) + "]"
                db.execute(
                    __import__("sqlalchemy").text(
                        "UPDATE knowledge_base SET embedding = CAST(:vec AS vector) WHERE id = :id"
                    ),
                    {"vec": vec_literal, "id": row.id},
                )
            except Exception as exc:
                # pgvector not available — the embedding_json fallback is still stored.
                print(f" (vector column skipped: {exc})", end="")

            db.commit()
            print(" ✓")

            # Respect OpenAI rate limits (3 RPM on free tier).
            if i < len(KNOWLEDGE_CHUNKS):
                time.sleep(0.4)

        print(f"[seeder] Done. {len(KNOWLEDGE_CHUNKS)} chunks seeded successfully.")

    except Exception as exc:
        db.rollback()
        print(f"\n[seeder] ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
