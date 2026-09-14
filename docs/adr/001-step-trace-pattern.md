# ADR 001: Standardized Step-Trace Pattern for Algorithm Visualization

- **Status**: Accepted
- **Date**: 2026-09-14
- **Applies to**: Backend (`backend/app/algorithms/`), Frontend (`frontend/src/components/`, `frontend/src/types/`)

---

## 1. Context
AlgoLens Pro visualizes algorithmic operations across 10 academic DAA curriculum modules. Without a standardized communication contract, each algorithm module risks creating custom, ad-hoc state structures, leading to tight coupling between client rendering and backend logic, code duplication, and inconsistent telemetry. We require a uniform, deterministic, and language-agnostic step-trace architecture.

---

## 2. Decision
We adopt the **Standardized Step-Trace Pattern**. All algorithm executions are computed by pure functions on the backend that generate a chronological sequence of execution steps alongside quantitative operational metrics.

### Backend Data Contract:
```python
{
    "steps": [...],
    "comparisons": int,     # where applicable
    "result_index": int,    # where applicable (-1 if not found)
    "metrics": {...}        # operational telemetry dictionary
}
```

### Frontend Data Contract:
```typescript
interface VisualizationTrace<TStep = unknown, TMetrics = Record<string, number | string | boolean>> {
  steps: TStep[];
  comparisons?: number;
  result_index?: number;
  metrics?: TMetrics;
}
```

---

## 3. Step Definition
A **step** represents a single discrete, immutable algorithmic transition or evaluation (e.g., comparing two elements, partitioning an array, updating boundary pointers, or marking a node visited).
- **Integrity Rule**: Every step must correspond to actual algorithmic work performed by the underlying code. Steps must **never** be fabricated or synthesized solely for decorative animation transitions.
- **Trace Chronology**: Steps are strictly ordered chronologically from initialization to termination.

---

## 4. Metrics
The `metrics` object provides quantitative operational telemetry captured during execution (such as cumulative comparisons, array swaps, recursion depth, or memory allocations). This separates pedagogical algorithmic metadata ($O(n)$, $O(\log n)$) from measured operational counts.

---

## 5. Backend Convention
- Implementations reside in `backend/app/algorithms/module<N>/` and adhere to `backend/app/algorithms/base.py`.
- Algorithm runners are pure functions with signature: `(input_data, ...) -> AlgorithmResult`.
- Functions must validate preconditions (e.g., Binary Search rejecting unsorted arrays with `ValueError`) rather than silently mutating user inputs.

---

## 6. Frontend Convention
- Visualization components consume backend traces using the generic `AnimationPlayer<TStep>` and `MetricsPanel`.
- The frontend is strictly a presentational rendering engine; it never re-implements or simulates algorithmic logic in the browser.
- Framer Motion renders step state transitions (active highlights, range boundaries, match indicators).

---

## 7. Scope of Reuse
This convention is the mandatory architectural pattern for all remaining curriculum modules (**Modules 2 through 10**), including Divide & Conquer, Dynamic Programming, Greedy Methods, Graph Algorithms, and Backtracking.

---

## 8. Consequences

### Positive:
- **Zero Frontend Duplication**: Frontend components focus purely on rendering and animation without duplicating algorithmic business logic.
- **Consistent Telemetry**: Side-by-side comparison arenas (such as Linear vs. Binary Search) easily synchronize playback across multiple algorithms.
- **Testability**: Pure backend algorithm functions are trivial to unit test with 100% determinism.

### Trade-offs:
- Trace payloads grow linearly with input size and operations count ($O(n)$ steps for linear scan). Large inputs ($n > 10,000$) must be capped or downsampled for browser animation budgets.
