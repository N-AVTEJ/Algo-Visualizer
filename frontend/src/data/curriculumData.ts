export interface CurriculumModuleMeta {
  id: number;
  order_index: number;
  name: string;
  category: string;
  description: string;
  short_tag: string;
  key_algorithms: string[];
  time_complexity: string;
  space_complexity: string;
  paradigm: string;
  accent: 'violet' | 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'fuchsia';
  highlights: string[];
}

export const CURRICULUM_CATEGORIES = [
  'All Modules',
  'Divide & Conquer',
  'Dynamic Programming',
  'Greedy',
  'Backtracking & Branch',
  'Complexity & NP',
] as const;

export const DEFAULT_CURRICULUM_MODULES: CurriculumModuleMeta[] = [
  {
    id: 1,
    order_index: 1,
    name: 'Algorithm Analysis',
    category: 'Foundations',
    description:
      'Mathematical foundations of asymptotic complexity: Big-O, Big-Omega, Big-Theta, recurrence relations, and Master Theorem.',
    short_tag: 'Asymptotic & Recurrence',
    key_algorithms: ['Linear vs Binary Search', 'Recurrence Trees', 'Master Method', 'Loop Invariants'],
    time_complexity: 'O(1) to O(2ⁿ)',
    space_complexity: 'O(1) to O(n)',
    paradigm: 'Analytical Framework',
    accent: 'violet',
    highlights: ['Recurrence Master Theorem', 'Empirical Telemetry Curve', 'Growth Rate Ranking'],
  },
  {
    id: 2,
    order_index: 2,
    name: 'Divide & Conquer',
    category: 'Divide & Conquer',
    description:
      'Recursive problem decomposition, subproblem solving, and synthesis with detailed execution trees and merge partitions.',
    short_tag: 'Recursive Partitioning',
    key_algorithms: ['Merge Sort', 'Quick Sort (Lomuto & Hoare)', 'Binary Search', 'Strassen Matrix'],
    time_complexity: 'O(n log n)',
    space_complexity: 'O(log n) - O(n)',
    paradigm: 'Divide & Conquer',
    accent: 'indigo',
    highlights: ['Interactive Merge Tree', 'Lomuto Pivot Animation', 'Partition Depth Tracker'],
  },
  {
    id: 3,
    order_index: 3,
    name: 'Backtracking',
    category: 'Backtracking & Branch',
    description:
      'Exhaustive state space tree traversal with intelligent pruning, constraint checking, and dead-end backtrack animations.',
    short_tag: 'State-Space Pruning',
    key_algorithms: ['N-Queens Problem', 'Sudoku Solver', 'Subset Sum', 'Hamiltonian Cycle'],
    time_complexity: 'O(n!) / O(2ⁿ)',
    space_complexity: 'O(n) Call Stack',
    paradigm: 'Exhaustive Search',
    accent: 'amber',
    highlights: ['Live Chessboard Heatmap', 'Pruned Branch Counter', 'Valid Placement Validator'],
  },
  {
    id: 4,
    order_index: 4,
    name: 'Dynamic Programming I',
    category: 'Dynamic Programming',
    description:
      'Optimal substructure and overlapping subproblems: tabular memoization, state-transition matrices, and all-pairs shortest paths.',
    short_tag: 'Tabulation & Substructure',
    key_algorithms: ['Floyd-Warshall', '0/1 Knapsack (Tabulation)', 'Longest Common Subsequence (LCS)'],
    time_complexity: 'O(V³) / O(n·W)',
    space_complexity: 'O(V²) Matrix',
    paradigm: 'Dynamic Programming',
    accent: 'emerald',
    highlights: ['DP Cell-by-Cell Heatmap', 'Interactive Matrix Scrub', 'Optimal Substructure Tracer'],
  },
  {
    id: 5,
    order_index: 5,
    name: 'Dynamic Programming II',
    category: 'Dynamic Programming',
    description:
      'Advanced dynamic programming paradigms: multi-stage graphs, matrix chain parenthesization, and Bellman-Ford negative cycles.',
    short_tag: 'Advanced DP Paradigms',
    key_algorithms: ['Matrix Chain Multiplication', 'Bellman-Ford', 'Edit Distance (Levenshtein)'],
    time_complexity: 'O(n³) / O(V·E)',
    space_complexity: 'O(n²)',
    paradigm: 'Dynamic Programming',
    accent: 'sky',
    highlights: ['Parenthesization Tree', 'Negative Cycle Alert', 'String Transform Alignment'],
  },
  {
    id: 6,
    order_index: 6,
    name: 'Greedy Method I',
    category: 'Greedy',
    description:
      'Locally optimal decision choices: deadline scheduling, profit maximization, and Huffman entropy encoding trees.',
    short_tag: 'Locally Optimal Choices',
    key_algorithms: ['Job Sequencing with Deadlines', 'Fractional Knapsack', 'Huffman Coding Tree'],
    time_complexity: 'O(n log n) - O(n²)',
    space_complexity: 'O(n)',
    paradigm: 'Greedy Strategy',
    accent: 'fuchsia',
    highlights: ['Gantt Slot Allocation', 'Profit Density Sorter', 'Bitcode Frequency Tree'],
  },
  {
    id: 7,
    order_index: 7,
    name: 'Greedy Method II',
    category: 'Greedy',
    description:
      'Greedy spanning tree algorithms and priority-queue shortest path explorations on weighted network topologies.',
    short_tag: 'Graph MST & Paths',
    key_algorithms: ["Kruskal's MST (Disjoint Set)", "Prim's Algorithm", "Dijkstra's Shortest Path"],
    time_complexity: 'O(E log V)',
    space_complexity: 'O(V + E)',
    paradigm: 'Greedy Graph Optimization',
    accent: 'violet',
    highlights: ['Union-Find Cycle Detection', 'Cut Property Visualizer', 'Priority Queue Relaxation'],
  },
  {
    id: 8,
    order_index: 8,
    name: 'Branch & Bound',
    category: 'Backtracking & Branch',
    description:
      'State-space branch exploration with upper/lower bounding functions for hard combinatorial optimization problems.',
    short_tag: 'Bounding & Pruning',
    key_algorithms: ['Travelling Salesperson (TSP)', '0/1 Knapsack (B&B)', '15-Puzzle (A* IDA*)'],
    time_complexity: 'O(2ⁿ) Worst / Bounded',
    space_complexity: 'O(2ⁿ) Live Nodes',
    paradigm: 'Branch & Bound',
    accent: 'rose',
    highlights: ['Cost Matrix Reduction', 'Live Bounding Prune Tree', 'Best-First Priority Queue'],
  },
  {
    id: 9,
    order_index: 9,
    name: 'P and NP Problems',
    category: 'Complexity & NP',
    description:
      'Turing determinism, certificate verification, polynomial-time verifiers, and non-deterministic state machines.',
    short_tag: 'Verification & Classes',
    key_algorithms: ['3-SAT Verifier', 'Polynomial Verification', 'Hamiltonian Path Verifier'],
    time_complexity: 'Poly Verification: O(nᵏ)',
    space_complexity: 'O(1) Certificate Check',
    paradigm: 'Complexity Theory',
    accent: 'sky',
    highlights: ['Clause Truth Matrix', 'Certificate Interactive Evaluator', 'Turing Branch Visualizer'],
  },
  {
    id: 10,
    order_index: 10,
    name: 'NP-Hard & NP-Complete',
    category: 'Complexity & NP',
    description:
      'Polynomial-time Karp reductions, Cook-Levin theorem, chromatic number graph coloring, and approximation bounds.',
    short_tag: 'Reductions & Intractability',
    key_algorithms: ['m-Coloring Problem', 'Vertex Cover', 'Clique Problem', 'TSP 2-Approximation'],
    time_complexity: 'Exponential / NP-C',
    space_complexity: 'O(V + E)',
    paradigm: 'Reductions & Heuristics',
    accent: 'amber',
    highlights: ['Chromatic Conflict Detector', 'Reduction Flow Graph', 'Approximation Ratio Meter'],
  },
];
