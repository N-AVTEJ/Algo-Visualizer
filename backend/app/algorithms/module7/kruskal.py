"""Kruskal's Minimum Spanning Tree algorithm with Disjoint Set Union (DSU) and edge step trace."""
from typing import Any, Dict, List, Optional, Set, Tuple, Union

Number = Union[int, float]


class UnionFind:
    """Disjoint Set Union (DSU) with path compression and rank optimization."""

    def __init__(self, elements: List[str]):
        self.parent: Dict[str, str] = {el: el for el in elements}
        self.rank: Dict[str, int] = {el: 0 for el in elements}

    def find(self, i: str) -> str:
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, i: str, j: str) -> bool:
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i == root_j:
            return False  # Already in same component (cycle)

        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1
        return True

    def get_components(self) -> Dict[str, List[str]]:
        """Return mapping of component root to list of constituent vertices."""
        comps: Dict[str, List[str]] = {}
        for el in self.parent:
            root = self.find(el)
            if root not in comps:
                comps[root] = []
            comps[root].append(el)
        return comps


def get_default_kruskal_graph() -> Dict[str, Any]:
    """Return standard 6-vertex connected weighted graph suitable for MST visualization."""
    return {
        "vertices": ["A", "B", "C", "D", "E", "F"],
        "edges": [
            {"u": "A", "v": "B", "weight": 4},
            {"u": "A", "v": "F", "weight": 2},
            {"u": "B", "v": "C", "weight": 6},
            {"u": "B", "v": "F", "weight": 5},
            {"u": "C", "v": "D", "weight": 3},
            {"u": "C", "v": "F", "weight": 1},
            {"u": "D", "v": "E", "weight": 2},
            {"u": "E", "v": "F", "weight": 4},
        ],
    }


def run_kruskal(
    vertices: Optional[List[str]] = None,
    edges: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Execute Kruskal's Minimum Spanning Tree algorithm and generate a comprehensive decision trace.

    Args:
        vertices: List of unique vertex identifiers.
        edges: List of undirected edges with 'u', 'v', 'weight'.

    Returns:
        Dict containing:
            - steps: Chronological decision trace
            - mst_edges: Final list of edges belonging to MST
            - total_weight: Sum of weights of MST edges
            - is_connected: Whether a single spanning tree connected all vertices
            - sorted_edges: Edges sorted in non-decreasing weight order
            - metrics: Operational summary metrics
    """
    if vertices is None or edges is None:
        default_data = get_default_kruskal_graph()
        vertices = default_data["vertices"]
        edges = default_data["edges"]

    v_count = len(vertices)
    if v_count < 2 or v_count > 12:
        raise ValueError("Vertex count must be between 2 and 12.")

    vertex_set = set(vertices)
    if len(vertex_set) != v_count:
        raise ValueError("Vertex identifiers must be unique.")

    if len(edges) < 1 or len(edges) > 30:
        raise ValueError("Edge count must be between 1 and 30.")

    cleaned_edges: List[Dict[str, Any]] = []
    for idx, e in enumerate(edges):
        if "u" not in e or "v" not in e or "weight" not in e:
            raise ValueError(f"Edge at index {idx} must contain 'u', 'v', and 'weight'.")
        u, v, w = str(e["u"]), str(e["v"]), e["weight"]
        if u not in vertex_set or v not in vertex_set:
            raise ValueError(f"Edge ({u}, {v}) references unknown vertex not in vertices list.")
        if u == v:
            raise ValueError(f"Self-loops ({u}, {u}) not supported in MST calculation.")
        if not isinstance(w, (int, float)):
            raise ValueError(f"Edge ({u}, {v}) weight must be a numeric value.")

        # Canonical ordering of edge vertices for undirected representation
        canonical_u, canonical_v = (u, v) if u < v else (v, u)
        cleaned_edges.append({
            "u": canonical_u,
            "v": canonical_v,
            "weight": w,
            "id": f"{canonical_u}-{canonical_v}",
        })

    # Sort edges by weight non-decreasing (greedy strategy)
    sorted_edges = sorted(cleaned_edges, key=lambda x: (x["weight"], x["id"]))

    dsu = UnionFind(vertices)
    mst_edges: List[Dict[str, Any]] = []
    rejected_edges: List[Dict[str, Any]] = []
    running_weight = 0

    steps: List[Dict[str, Any]] = []

    def get_components_summary() -> List[List[str]]:
        comps = dsu.get_components()
        return [sorted(members) for members in comps.values()]

    # Step 1: Init graph
    steps.append({
        "action": "init",
        "current_edge": None,
        "mst_edges": [],
        "rejected_edges": [],
        "running_weight": 0,
        "components": get_components_summary(),
        "is_cycle": False,
        "sorted_edges": list(sorted_edges),
        "explanation": f"Graph initialized with {v_count} vertices and {len(sorted_edges)} edges. Disjoint sets created.",
        "metrics": {
            "total_weight": 0,
            "mst_edge_count": 0,
            "edges_considered": 0,
            "components_count": v_count,
            "current_step": 1,
        },
    })

    # Step 2: Sorted edges
    sorted_edges_str = ", ".join([f"{e['u']}-{e['v']}({e['weight']})" for e in sorted_edges])
    steps.append({
        "action": "sorted_edges",
        "current_edge": None,
        "mst_edges": [],
        "rejected_edges": [],
        "running_weight": 0,
        "components": get_components_summary(),
        "is_cycle": False,
        "sorted_edges": list(sorted_edges),
        "explanation": f"Sorted edges by non-decreasing weight: {sorted_edges_str}.",
        "metrics": {
            "total_weight": 0,
            "mst_edge_count": 0,
            "edges_considered": 0,
            "components_count": v_count,
            "current_step": 2,
        },
    })

    edges_considered = 0

    for edge in sorted_edges:
        edges_considered += 1
        u = edge["u"]
        v = edge["v"]
        w = edge["weight"]

        root_u = dsu.find(u)
        root_v = dsu.find(v)
        is_cycle = root_u == root_v

        # Action: Checking edge
        steps.append({
            "action": "checking",
            "current_edge": dict(edge),
            "mst_edges": list(mst_edges),
            "rejected_edges": list(rejected_edges),
            "running_weight": running_weight,
            "components": get_components_summary(),
            "is_cycle": is_cycle,
            "sorted_edges": list(sorted_edges),
            "explanation": (
                f"Evaluating edge {u}-{v} (weight: {w}). "
                + (f"Find({u})={root_u} == Find({v})={root_v} -> CYCLE DETECTED!" if is_cycle else f"Find({u})={root_u} != Find({v})={root_v} -> Safe to connect.")
            ),
            "metrics": {
                "total_weight": running_weight,
                "mst_edge_count": len(mst_edges),
                "edges_considered": edges_considered,
                "components_count": len(dsu.get_components()),
                "current_step": len(steps) + 1,
            },
        })

        if not is_cycle:
            dsu.union(u, v)
            mst_edges.append(dict(edge))
            running_weight += w

            # Action: Added
            steps.append({
                "action": "added",
                "current_edge": dict(edge),
                "mst_edges": list(mst_edges),
                "rejected_edges": list(rejected_edges),
                "running_weight": running_weight,
                "components": get_components_summary(),
                "is_cycle": False,
                "sorted_edges": list(sorted_edges),
                "explanation": f"ACCEPTED: Edge {u}-{v} (wt: {w}) added to MST. Running MST weight = {running_weight}.",
                "metrics": {
                    "total_weight": running_weight,
                    "mst_edge_count": len(mst_edges),
                    "edges_considered": edges_considered,
                    "components_count": len(dsu.get_components()),
                    "current_step": len(steps) + 1,
                },
            })
        else:
            rejected_edges.append(dict(edge))

            # Action: Rejected
            steps.append({
                "action": "rejected",
                "current_edge": dict(edge),
                "mst_edges": list(mst_edges),
                "rejected_edges": list(rejected_edges),
                "running_weight": running_weight,
                "components": get_components_summary(),
                "is_cycle": True,
                "sorted_edges": list(sorted_edges),
                "explanation": f"REJECTED: Edge {u}-{v} (wt: {w}) rejected because vertices are already connected in component '{root_u}'.",
                "metrics": {
                    "total_weight": running_weight,
                    "mst_edge_count": len(mst_edges),
                    "edges_considered": edges_considered,
                    "components_count": len(dsu.get_components()),
                    "current_step": len(steps) + 1,
                },
            })

    final_components = dsu.get_components()
    is_connected = len(final_components) == 1 and len(mst_edges) == v_count - 1

    completion_explanation = (
        f"Kruskal's MST Complete! Connected all {v_count} vertices with {len(mst_edges)} edges. Total MST weight = {running_weight}."
        if is_connected
        else f"Spanning Forest Complete: Input graph is disconnected ({len(final_components)} disjoint components). Total forest weight = {running_weight}."
    )

    steps.append({
        "action": "completed",
        "current_edge": None,
        "mst_edges": list(mst_edges),
        "rejected_edges": list(rejected_edges),
        "running_weight": running_weight,
        "components": get_components_summary(),
        "is_cycle": False,
        "sorted_edges": list(sorted_edges),
        "explanation": completion_explanation,
        "metrics": {
            "total_weight": running_weight,
            "mst_edge_count": len(mst_edges),
            "edges_considered": edges_considered,
            "components_count": len(final_components),
            "current_step": len(steps) + 1,
        },
    })

    return {
        "steps": steps,
        "mst_edges": mst_edges,
        "rejected_edges": rejected_edges,
        "total_weight": running_weight,
        "is_connected": is_connected,
        "vertices": vertices,
        "edges": cleaned_edges,
        "sorted_edges": sorted_edges,
        "metrics": {
            "vertices_count": v_count,
            "edges_considered": edges_considered,
            "mst_edge_count": len(mst_edges),
            "total_mst_weight": running_weight,
            "is_connected": is_connected,
            "final_components_count": len(final_components),
            "total_steps": len(steps),
        },
    }
