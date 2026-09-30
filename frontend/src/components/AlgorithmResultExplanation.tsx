import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Cpu,
  Sparkles,
  GitBranch,
  Clock,
} from 'lucide-react';

export interface StepExplanationItem {
  stepNumber: number;
  title: string;
  action: string;
  verbalExplanation: string;
  stateBadge: string;
}

export interface ModuleExecutionExplanation {
  moduleId: number;
  algorithmName: string;
  verdictTitle: string;
  verdictSummary: string;
  decisionLogic: string;
  invariantProof: string;
  timeComplexityExplanation: string;
  spaceComplexityExplanation: string;
  stepByStepJourney: StepExplanationItem[];
}

export const MODULE_EXPLANATIONS: Record<number, ModuleExecutionExplanation> = {
  1: {
    moduleId: 1,
    algorithmName: 'Linear Search vs Binary Search',
    verdictTitle: 'Search Space Resolution & Target Deduction',
    verdictSummary:
      'Binary Search eliminated half of all remaining candidates during each iteration, locating the target in logarithmic time O(log n), whereas Linear Search checked every element sequentially one by one.',
    decisionLogic:
      'At each step, the algorithm calculated the midpoint index mid = floor((left + right) / 2). Because the input array is strictly sorted, if target > arr[mid], the target is mathematically guaranteed not to exist in the left subarray [left..mid]. Thus, the left boundary was advanced to mid + 1 without checking any of those elements.',
    invariantProof:
      'Loop Invariant: At the start of every while-loop iteration, if the target exists anywhere in the original array, it must lie strictly within the sub-index range [left, right]. When left exceeds right, the range is empty, conclusively proving target absence.',
    timeComplexityExplanation:
      'Binary Search executes at most ⌈log₂(n)⌉ comparisons because the interval length halving recurrence is T(n) = T(n/2) + 1 = O(log n). For n=1,000,000, Binary Search requires at most 20 comparisons versus up to 1,000,000 for Linear Search.',
    spaceComplexityExplanation:
      'Iterative Binary Search maintains only three integer pointer variables (left, right, mid), resulting in strict O(1) auxiliary space complexity with zero heap allocation.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Initialize Search Space',
        action: 'left = 0, right = n - 1',
        verbalExplanation:
          'Set left pointer to index 0 and right pointer to index n-1, encompassing the full sorted array span.',
        stateBadge: 'Bounds Set',
      },
      {
        stepNumber: 2,
        title: 'Evaluate Midpoint Pivot',
        action: 'mid = (left + right) // 2',
        verbalExplanation:
          'Computed midpoint. Read element at mid and compared against the target value.',
        stateBadge: 'Inspection',
      },
      {
        stepNumber: 3,
        title: 'Prune Half of Search Space',
        action: 'left = mid + 1 OR right = mid - 1',
        verbalExplanation:
          'Because the element at mid did not match, one entire half of the array was discarded without inspecting individual items.',
        stateBadge: 'Halving',
      },
      {
        stepNumber: 4,
        title: 'Exact Match or Convergence',
        action: 'arr[mid] == target',
        verbalExplanation:
          'Target matched precisely at current midpoint. Returned current index as the final search result.',
        stateBadge: 'Complete',
      },
    ],
  },
  2: {
    moduleId: 2,
    algorithmName: 'Merge Sort & Quick Sort',
    verdictTitle: 'Divide, Partition, and Recursive Synthesis',
    verdictSummary:
      'The array was recursively split into subproblems until base arrays of size 1 were reached, which are trivially sorted. The sorted sub-lists were then merged back in linear time using a two-pointer technique.',
    decisionLogic:
      'Merge Sort uses the Master Theorem recurrence T(n) = 2T(n/2) + O(n). By dividing the problem evenly into two halves of size n/2 and spending linear O(n) work to merge the two sorted halves, it completely avoids quadratic comparisons.',
    invariantProof:
      'Merge Invariant: During each merge step, the two child subarrays are already sorted. By repeatedly selecting the smaller of the two head pointers, the merged target array is guaranteed to remain monotonically sorted at every step.',
    timeComplexityExplanation:
      'The recursion tree has a depth of exactly ⌈log₂ n⌉ levels. At each level k, the total work across all merges is exactly n. Therefore, total execution cost is n × log₂(n) = O(n log n) in all cases (best, average, and worst).',
    spaceComplexityExplanation:
      'Merge Sort requires an auxiliary array of size O(n) to hold the merged elements temporarily before writing back to the main array. In contrast, Quick Sort achieves in-place sorting requiring only O(log n) stack space.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Recursive Decomposition',
        action: 'mid = len(arr) // 2',
        verbalExplanation:
          'Recursively split array into left half arr[0..mid] and right half arr[mid..n] until single-element base cases were reached.',
        stateBadge: 'Divide',
      },
      {
        stepNumber: 2,
        title: 'Two-Pointer Comparison',
        action: 'compare left[i] vs right[j]',
        verbalExplanation:
          'Initialized two pointers i and j. Compared elements and placed the smaller value into the auxiliary output buffer.',
        stateBadge: 'Conquer',
      },
      {
        stepNumber: 3,
        title: 'Exhaust Remaining Elements',
        action: 'append remaining slice',
        verbalExplanation:
          'Once one subarray was exhausted, all remaining elements of the other subarray were appended in order.',
        stateBadge: 'Synthesis',
      },
      {
        stepNumber: 4,
        title: 'Tree Aggregation Complete',
        action: 'return sorted_array',
        verbalExplanation:
          'Recursion rolled back to the root level, producing the fully sorted array in deterministic O(n log n) steps.',
        stateBadge: 'Complete',
      },
    ],
  },
  3: {
    moduleId: 3,
    algorithmName: 'N-Queens Backtracking',
    verdictTitle: 'State-Space Tree Traversal with Constraint Pruning',
    verdictSummary:
      'The backtracking engine systematically explored chessboard placements row by row. Whenever a queen placement violated column or diagonal constraints, that entire branch of the decision tree was pruned immediately.',
    decisionLogic:
      'Instead of generating all nⁿ possible chessboard configurations (which would be ~16.7 million checks for n=8), the algorithm uses bounding functions. Row r only considers columns c where no previous queen exists in column c or on diagonals (row - prev_row == abs(col - prev_col)).',
    invariantProof:
      'Correctness Guarantee: A queen placed on row r is verified against all rows 0..(r-1). If row r reaches index n, all n queens have been placed with zero mutually attacking pairs, guaranteeing an exact solution.',
    timeComplexityExplanation:
      'Worst-case combinatorial upper bound is O(n!), but intelligent diagonal pruning reduces the practical search space to a tiny fraction (< 0.05% of nodes visited for standard boards).',
    spaceComplexityExplanation:
      'The call stack reaches a maximum depth of n frames, and the board representation requires a single 1D array of size n storing the column position for each row: O(n) space.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Row Placement Attempt',
        action: 'for col in range(n)',
        verbalExplanation:
          'Attempted to place a queen at the first available column in the current row.',
        stateBadge: 'Explore',
      },
      {
        stepNumber: 2,
        title: 'Conflict Checking (Bounding Function)',
        action: 'is_safe(row, col)',
        verbalExplanation:
          'Verified that no previously placed queen shares the same column or diagonal.',
        stateBadge: 'Validate',
      },
      {
        stepNumber: 3,
        title: 'Backtrack on Conflict',
        action: 'board[row] = -1',
        verbalExplanation:
          'When all columns in a row caused conflicts, the algorithm backed up to the previous row and shifted that queen to the right, pruning dead ends.',
        stateBadge: 'Prune',
      },
      {
        stepNumber: 4,
        title: 'Solution State Reached',
        action: 'row == n',
        verbalExplanation:
          'Successfully placed queens on all n rows without conflict, recording the valid non-attacking configuration.',
        stateBadge: 'Solved',
      },
    ],
  },
  4: {
    moduleId: 4,
    algorithmName: 'Floyd-Warshall All-Pairs Shortest Path',
    verdictTitle: 'Dynamic Programming Triplet Matrix Relaxation',
    verdictSummary:
      'Calculated the shortest path between every pair of vertices by iteratively allowing intermediate vertices from the set {0, 1, ..., k}. The final distance matrix contains the global shortest paths.',
    decisionLogic:
      'For every intermediate vertex k, the algorithm evaluated whether routing from vertex i to vertex j via vertex k offered a strictly shorter distance: D[i][j] = min(D[i][j], D[i][k] + D[k][j]).',
    invariantProof:
      'Optimal Substructure Invariant: At the end of iteration k, matrix element D[i][j] contains the length of the shortest path from vertex i to vertex j that uses only vertices from {0, 1, ..., k} as intermediate nodes.',
    timeComplexityExplanation:
      'Three nested loops iterate over all V vertices: O(V³). This is optimal for dense graphs compared to running Dijkstra V times with adjacency matrices.',
    spaceComplexityExplanation:
      'Maintains a 2D distance matrix of size V × V: O(V²) space. Memory accesses are sequential and cache-friendly.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Base Adjacency Matrix Setup',
        action: 'D[i][j] = weight or ∞',
        verbalExplanation:
          'Initialized matrix with direct edge weights and set D[i][i] = 0 for self-loops.',
        stateBadge: 'Matrix Init',
      },
      {
        stepNumber: 2,
        title: 'Iterate Intermediate Vertex k',
        action: 'for k in range(V)',
        verbalExplanation:
          'Allowed vertex k to serve as an intermediate waypoint between all pairs (i, j).',
        stateBadge: 'Relaxation',
      },
      {
        stepNumber: 3,
        title: 'Cell Update Comparison',
        action: 'if D[i][k] + D[k][j] < D[i][j]',
        verbalExplanation:
          'Whenever the path detouring through k was shorter than the direct path, cell D[i][j] was updated.',
        stateBadge: 'Update',
      },
      {
        stepNumber: 4,
        title: 'Final Distance Convergence',
        action: 'D matrix finalized',
        verbalExplanation:
          'After V iterations, all intermediate vertex combinations were exhausted, yielding all-pairs shortest paths.',
        stateBadge: 'Complete',
      },
    ],
  },
  5: {
    moduleId: 5,
    algorithmName: '0/1 Knapsack & Dynamic Programming II',
    verdictTitle: 'Optimal Substructure & Tabulation Resolution',
    verdictSummary:
      'Constructed a 2D DP table where cell dp[i][w] represents the maximum profit obtainable using a subset of the first i items with a maximum total capacity of w. Selected items were deduced via backward trace.',
    decisionLogic:
      'For item i with weight wᵢ and profit vᵢ: If wᵢ > w, item i cannot fit, so dp[i][w] = dp[i-1][w]. If it fits, choose the maximum between excluding it (dp[i-1][w]) and including it (vᵢ + dp[i-1][w - wᵢ]).',
    invariantProof:
      'Bellman Principle of Optimality: Any sub-policy of an optimal policy must itself be optimal. By considering all sub-capacities from 0 to W, the table guarantees the global optimum without repeating overlapping calculations.',
    timeComplexityExplanation:
      'The DP table has dimensions (n + 1) × (W + 1). Each entry requires O(1) comparison work, yielding O(n·W) pseudo-polynomial time.',
    spaceComplexityExplanation:
      'Requires an (n + 1) × (W + 1) matrix for item reconstruction: O(n·W) space. Can be optimized to O(W) if only the maximum value is required.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Initialize Base Capacity Row',
        action: 'dp[0][w] = 0, dp[i][0] = 0',
        verbalExplanation:
          'Set capacity 0 and 0-item subsets to 0 profit as base boundary conditions.',
        stateBadge: 'Base Case',
      },
      {
        stepNumber: 2,
        title: 'Include vs Exclude Evaluation',
        action: 'max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]])',
        verbalExplanation:
          'For each cell, evaluated whether taking item i produced higher value than leaving it behind.',
        stateBadge: 'Tabulation',
      },
      {
        stepNumber: 3,
        title: 'Table Cell Convergence',
        action: 'dp[n][W] = max_profit',
        verbalExplanation:
          'The bottom-right cell dp[n][W] converged to the absolute maximum possible profit.',
        stateBadge: 'Optimal Val',
      },
      {
        stepNumber: 4,
        title: 'Backtrack Selected Items',
        action: 'traceback from dp[n][W]',
        verbalExplanation:
          'Traced backward through the table: if dp[i][w] != dp[i-1][w], item i was included in the optimal knapsack subset.',
        stateBadge: 'Selection',
      },
    ],
  },
  6: {
    moduleId: 6,
    algorithmName: 'Job Sequencing with Deadlines',
    verdictTitle: 'Greedy Profit Maximization with Time-Slot Allocation',
    verdictSummary:
      'Sorted all jobs in descending order of profit and greedily scheduled each job into its latest possible free time slot before its deadline, maximizing overall total profit.',
    decisionLogic:
      'A job with deadline d can be executed in any time slot 1, 2, ..., d. To leave earlier slots open for jobs with tighter deadlines, the greedy strategy always attempts to allocate slot d first, then d-1, and so on.',
    invariantProof:
      'Greedy Choice Property: Placing the highest-profit job at its latest feasible deadline never rules out a better valid schedule. By induction, the resulting schedule is guaranteed to be optimal.',
    timeComplexityExplanation:
      'Sorting n jobs by profit takes O(n log n). Allocating slots naively takes O(n × max_deadline) or O(n²). Using Disjoint Set Union (DSU) reduces slot allocation to O(n·α(n)).',
    spaceComplexityExplanation:
      'Requires an array of size max_deadline to track slot reservations: O(max_deadline) space.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Descending Profit Sort',
        action: 'jobs.sort(key=profit, reverse=True)',
        verbalExplanation:
          'Ordered all available candidate jobs from highest profit to lowest profit.',
        stateBadge: 'Sort',
      },
      {
        stepNumber: 2,
        title: 'Latest Feasible Slot Search',
        action: 'for slot in range(min(n, deadline), 0, -1)',
        verbalExplanation:
          'For each job, checked slots backward from its deadline to find the latest unreserved time slot.',
        stateBadge: 'Slot Check',
      },
      {
        stepNumber: 3,
        title: 'Gantt Slot Reservation',
        action: 'schedule[slot] = job_id',
        verbalExplanation:
          'Reserved the slot for the job and added its profit to the cumulative total.',
        stateBadge: 'Allocate',
      },
      {
        stepNumber: 4,
        title: 'Schedule Finalization',
        action: 'return total_profit, jobs',
        verbalExplanation:
          'All jobs were processed, yielding the optimal schedule sequence and maximum revenue.',
        stateBadge: 'Complete',
      },
    ],
  },
  7: {
    moduleId: 7,
    algorithmName: "Kruskal's Minimum Spanning Tree",
    verdictTitle: 'Greedy Edge Sorting & Disjoint Set Cycle Prevention',
    verdictSummary:
      "Constructed the Minimum Spanning Tree (MST) by sorting all graph edges by weight and greedily adding edges that connect two different connected components, using Union-Find to prevent cycles.",
    decisionLogic:
      'An edge (u, v) is added if and only if Find(u) != Find(v). If u and v already belong to the same component, adding the edge would form a redundant cycle, so it is safely discarded.',
    invariantProof:
      'Cut Property Invariant: For any cut in the graph, the minimum-weight edge crossing the cut must belong to the Minimum Spanning Tree. Sorting edges guarantees that the selected edge is always the minimum-weight cut crossing.',
    timeComplexityExplanation:
      'Sorting E edges takes O(E log E) = O(E log V). The Disjoint Set Union operations with path compression take O(E · α(V)), making edge sorting the dominant factor: O(E log V).',
    spaceComplexityExplanation:
      'Requires parent and rank arrays for V vertices in the Disjoint Set structure: O(V) space.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Sort Edges by Weight',
        action: 'edges.sort(key=weight)',
        verbalExplanation:
          'Ranked all graph edges in ascending order of their weights.',
        stateBadge: 'Edge Sort',
      },
      {
        stepNumber: 2,
        title: 'Disjoint Set Cycle Inspection',
        action: 'find(u) != find(v)',
        verbalExplanation:
          'Queried the Union-Find data structure to verify if endpoints u and v reside in separate trees.',
        stateBadge: 'Find-Set',
      },
      {
        stepNumber: 3,
        title: 'Union Components & Include Edge',
        action: 'union(u, v), mst.append(edge)',
        verbalExplanation:
          'United the two sets, included the edge in the MST, and accumulated its weight.',
        stateBadge: 'Union-Set',
      },
      {
        stepNumber: 4,
        title: 'Spanning Tree Achieved',
        action: 'len(mst) == V - 1',
        verbalExplanation:
          'Exactly V - 1 edges were selected connecting all vertices with minimum total cost and zero cycles.',
        stateBadge: 'Complete',
      },
    ],
  },
  8: {
    moduleId: 8,
    algorithmName: 'Branch & Bound (TSP / Knapsack)',
    verdictTitle: 'Cost-Matrix Reduction & Best-First State Space Search',
    verdictSummary:
      'Solved the optimization problem by exploring a state space tree using lower bound estimators. Branches whose estimated lower bound exceeded the current best known upper bound were pruned.',
    decisionLogic:
      'Reduced cost matrices establish a rigorous mathematical lower bound for any tour passing through a partial path. By always expanding the live node with the lowest lower bound (Least Cost Branch & Bound), non-optimal branches are pruned early.',
    invariantProof:
      'Bounding Invariant: If a node has lower bound LB >= current_best_solution, no descendant of that node can ever produce a tour better than current_best_solution. Pruning that entire subtree is mathematically guaranteed not to discard the global optimum.',
    timeComplexityExplanation:
      'Worst case remains O(2ⁿ) or O(n!), but on average branch and bound inspects significantly fewer nodes than exhaustive brute force.',
    spaceComplexityExplanation:
      'Maintains a priority queue of live state nodes: O(2ⁿ) worst case, with O(n²) matrix storage per node.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Root Node Matrix Reduction',
        action: 'reduce_rows(), reduce_cols()',
        verbalExplanation:
          'Subtracted row and column minimums to compute the initial global lower bound at the root.',
        stateBadge: 'Root Bound',
      },
      {
        stepNumber: 2,
        title: 'Expand Candidate Branch Nodes',
        action: 'for next_city in unvisited',
        verbalExplanation:
          'Generated child state nodes representing travel from current city to each unvisited city.',
        stateBadge: 'Branch',
      },
      {
        stepNumber: 3,
        title: 'Evaluate Bound & Prune Inferior Branches',
        action: 'if child.bound >= upper_bound: prune',
        verbalExplanation:
          'Calculated reduced matrix lower bounds for each child. Discarded nodes worse than the incumbent tour.',
        stateBadge: 'Bound & Prune',
      },
      {
        stepNumber: 4,
        title: 'Optimal Leaf Node Tour',
        action: 'return optimal_tour, min_cost',
        verbalExplanation:
          'Reached a leaf node where all cities were visited with the absolute minimum cost.',
        stateBadge: 'Optimal',
      },
    ],
  },
  9: {
    moduleId: 9,
    algorithmName: '3-SAT Problem & Polynomial Verification',
    verdictTitle: 'Boolean CNF Evaluation & Certificate Verification',
    verdictSummary:
      'Evaluated a Boolean formula in Conjunctive Normal Form (CNF) where each clause contains 3 literals. Verified whether a given truth assignment satisfies all clauses simultaneously in polynomial time O(m·k).',
    decisionLogic:
      'A CNF formula is satisfied if and only if EVERY clause evaluates to TRUE. A clause is TRUE if at least ONE of its 3 literals evaluates to TRUE under the given assignment.',
    invariantProof:
      'Deterministic Verification Invariant: While finding a satisfying assignment is NP-complete, verifying a proposed assignment takes linear time O(number of clauses). This defines the complexity class NP.',
    timeComplexityExplanation:
      'Verification runs in O(m) time where m is the number of clauses. Brute-force checking all 2ⁿ variable assignments takes O(2ⁿ · m) exponential time.',
    spaceComplexityExplanation:
      'Requires O(n) space to store the truth values of the n Boolean variables and O(m) for clause representations.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Parse CNF Clauses',
        action: 'formula = (x₁ ∨ ¬x₂ ∨ x₃) ∧ ...',
        verbalExplanation:
          'Loaded Boolean formula with clauses in 3-literal disjunctive form.',
        stateBadge: 'CNF Setup',
      },
      {
        stepNumber: 2,
        title: 'Substitute Truth Values',
        action: 'assign variables {x₁: T, x₂: F, ...}',
        verbalExplanation:
          'Substituted certificate truth values into variables across all clauses.',
        stateBadge: 'Evaluation',
      },
      {
        stepNumber: 3,
        title: 'Clause-by-Clause Verification',
        action: 'clause_satisfied = any(literal_values)',
        verbalExplanation:
          'Evaluated each clause individually. Marked clause as satisfied if at least one literal was True.',
        stateBadge: 'Clause Check',
      },
      {
        stepNumber: 4,
        title: 'Global Certificate Verdict',
        action: 'all(clauses) == True',
        verbalExplanation:
          'Formula is satisfied because all clauses evaluate to True under the verified certificate.',
        stateBadge: 'Verified',
      },
    ],
  },
  10: {
    moduleId: 10,
    algorithmName: 'Graph Coloring (m-Coloring) & NP-Completeness',
    verdictTitle: 'Chromatic Number & Constraint Backtracking',
    verdictSummary:
      'Assigned colors from a palette of size m to vertices such that no two adjacent vertices share the same color. Determined whether the graph has chromatic number χ(G) ≤ m.',
    decisionLogic:
      'For vertex v, candidate colors 1..m were tested. If neighbor u is already assigned color c, color c is illegal for v. If all m colors are illegal for v, the algorithm backtracks to vertex v-1.',
    invariantProof:
      'Adjacency Invariant: At every step, the partial coloring on vertices 0..v contains zero conflicting adjacent edges. Reaching vertex V with this property guarantees a valid m-coloring.',
    timeComplexityExplanation:
      'Graph 3-Coloring is NP-Complete (Karp Reduction from 3-SAT). The worst-case search space is O(m^V), but degree-heuristic ordering prunes the majority of conflicts.',
    spaceComplexityExplanation:
      'Requires a colors array of size V storing the assigned color index for each vertex: O(V) space.',
    stepByStepJourney: [
      {
        stepNumber: 1,
        title: 'Initialize Color Assignment',
        action: 'color = [0] * V',
        verbalExplanation:
          'Set all vertex colors to 0 (uncolored) and defined color palette 1..m.',
        stateBadge: 'Init',
      },
      {
        stepNumber: 2,
        title: 'Test Color Against Neighbors',
        action: 'is_safe(v, c)',
        verbalExplanation:
          'Verified that no adjacent neighbor connected by an edge shares color c.',
        stateBadge: 'Adjacency Check',
      },
      {
        stepNumber: 3,
        title: 'Assign Color or Backtrack',
        action: 'color[v] = c OR backtrack',
        verbalExplanation:
          'Assigned legal color c. If no legal color was available, rolled back color on previous vertex.',
        stateBadge: 'Assign/Prune',
      },
      {
        stepNumber: 4,
        title: 'Chromatic Valid Coloring',
        action: 'all vertices colored',
        verbalExplanation:
          'Successfully assigned valid colors to all vertices without adjacent conflicts.',
        stateBadge: 'Valid Coloring',
      },
    ],
  },
};

interface Props {
  moduleId: number;
  currentAlgorithmName?: string;
}

export const AlgorithmResultExplanation: React.FC<Props> = ({
  moduleId,
  currentAlgorithmName,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeStepTab, setActiveStepTab] = useState<number | null>(null);

  const explanation = MODULE_EXPLANATIONS[moduleId] || MODULE_EXPLANATIONS[1];
  const displayAlgoName = currentAlgorithmName || explanation.algorithmName;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden mt-8 transition-all">
      {/* Header with Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="algorithm-explanation-content"
        className="w-full text-left p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors border-b border-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/80"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                How The Algorithm Reached The Result (In Words)
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-800/50 text-indigo-300 font-semibold">
                Verbal Deduction
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step plain-English explanation, decision invariants, and mathematical verification for {displayAlgoName}.
            </p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 ml-4 shrink-0">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="algorithm-explanation-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-7 space-y-6"
          >
            {/* Executive Verdict Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Executive Result Verdict</span>
              </div>
              <h4 className="text-base font-bold text-white">{explanation.verdictTitle}</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {explanation.verdictSummary}
              </p>
            </div>

            {/* Decision Logic & Mathematical Invariant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                  <GitBranch className="w-4 h-4 text-violet-400" />
                  <span>Decision Logic & State Transitions</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {explanation.decisionLogic}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Correctness Invariant & Mathematical Proof</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {explanation.invariantProof}
                </p>
              </div>
            </div>

            {/* Step-by-Step Chronological Journey in Words */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Chronological Step-By-Step Walkthrough in Words</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {explanation.stepByStepJourney.length} Distinct Phases
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {explanation.stepByStepJourney.map((step, idx) => {
                  const isSelected = activeStepTab === idx;
                  return (
                    <div
                      key={step.stepNumber}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => setActiveStepTab(isSelected ? null : idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveStepTab(isSelected ? null : idx);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center border border-indigo-500/20">
                            {step.stepNumber}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {step.stateBadge}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white mb-1">{step.title}</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {step.verbalExplanation}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/60 font-mono text-[10px] text-indigo-400 truncate">
                        {step.action}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Asymptotic Complexity in Words */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60">
              <div className="flex items-start space-x-3 text-xs">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white block">Time Complexity in Words:</span>
                  <span className="text-slate-400 leading-relaxed">
                    {explanation.timeComplexityExplanation}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white block">Space Complexity in Words:</span>
                  <span className="text-slate-400 leading-relaxed">
                    {explanation.spaceComplexityExplanation}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
