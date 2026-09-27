export interface VideoLectureInfo {
  algorithmName: string;
  moduleId: number;
  title: string;
  educator: string;
  embedUrl: string;
  duration: string;
  description: string;
  keyTopics: string[];
}

export const VIDEO_LECTURES: Record<string, VideoLectureInfo> = {
  // Module 1: Algorithm Analysis
  'linear search': {
    algorithmName: 'Linear Search',
    moduleId: 1,
    title: 'Linear Search vs Binary Search Analysis',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/C46QfTjVCNU',
    duration: '16:45',
    description: 'Detailed asymptotic analysis of sequential scan, best case O(1), and worst case O(n) loop bounds.',
    keyTopics: ['Sequential traversal', 'Loop invariant proof', 'Best/Worst case analysis', 'Cache spatial locality'],
  },
  'binary search': {
    algorithmName: 'Binary Search',
    moduleId: 1,
    title: 'Binary Search Algorithm & Recurrence Relation',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/C46QfTjVCNU',
    duration: '22:10',
    description: 'Halving search space logic on sorted arrays, recurrence T(n) = T(n/2) + c, and O(log n) derivation.',
    keyTopics: ['Search space interval halving', 'Three-way conditional branch', 'Logarithmic recurrence derivation', 'Boundary condition handling'],
  },
  'asymptotic analysis': {
    algorithmName: 'Asymptotic Analysis',
    moduleId: 1,
    title: 'Big-O, Omega, and Theta Notations Explained',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/A03oI0znAoc',
    duration: '28:30',
    description: 'Formal mathematical definitions of asymptotic upper bound (O), lower bound (Ω), and tight bound (Θ).',
    keyTopics: ['Formal limits & constants c, n₀', 'Rate of growth hierarchy', 'Master Theorem formulas', 'Drop lower order terms'],
  },

  // Module 2: Divide & Conquer
  'merge sort': {
    algorithmName: 'Merge Sort',
    moduleId: 2,
    title: '2.6.1 Merge Sort Algorithm & Recursion Tree',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/jlHkDBEumP0',
    duration: '24:50',
    description: 'Divide & conquer paradigm, recursion execution tree, merging two sorted lists, and O(n log n) proof.',
    keyTopics: ['Divide into subproblems of size n/2', 'Two-pointer merge procedure', 'Recurrence T(n) = 2T(n/2) + O(n)', 'O(n) auxiliary memory trade-off'],
  },
  'quick sort': {
    algorithmName: 'Quick Sort',
    moduleId: 2,
    title: '2.8.1 Quick Sort Algorithm & Lomuto Partitioning',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/7h1s2SojIRw',
    duration: '31:20',
    description: 'In-place partitioning, pivot element selection, best case O(n log n), and worst case O(n²) avoidance.',
    keyTopics: ['Lomuto & Hoare partition schemes', 'In-place element swapping', 'Pivot final placement guarantee', 'Randomized pivot strategies'],
  },

  // Module 3: Backtracking
  'n-queens': {
    algorithmName: 'N-Queens',
    moduleId: 3,
    title: '5.1 N Queens Problem using Backtracking',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/xFv_Hl4B83A',
    duration: '27:15',
    description: 'State space tree representation, bounding functions, diagonal conflict checking, and backtrack pruning.',
    keyTopics: ['Row-by-row placement strategy', 'Row, column, and diagonal conflict math', 'Explicit state-space tree traversal', 'Pruning dead-end search branches'],
  },
  'backtracking': {
    algorithmName: 'Backtracking Paradigm',
    moduleId: 3,
    title: 'Backtracking General Method & Bounding Functions',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/xFv_Hl4B83A',
    duration: '25:40',
    description: 'Systematic exploration of candidate solutions with pruning, dead-end retreat, and state restoration.',
    keyTopics: ['State space tree formulation', 'Explicit vs implicit constraints', 'Depth-first search with pruning', 'Branch termination conditions'],
  },

  // Module 4: Dynamic Programming I
  'floyd-warshall': {
    algorithmName: 'Floyd-Warshall',
    moduleId: 4,
    title: '4.5.1 Floyd Warshall All Pairs Shortest Path',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/oNI0rf2P9gE',
    duration: '29:40',
    description: 'Matrix recurrence D[i][j] = min(D[i][j], D[i][k] + D[k][j]), intermediate vertex relaxation, and O(V³) derivation.',
    keyTopics: ['Intermediate vertex k relaxation', 'Distance matrix sequence A⁰ through Aⁿ', 'Negative cycle detection', 'Dynamic programming optimal substructure'],
  },
  '0/1 knapsack': {
    algorithmName: '0/1 Knapsack',
    moduleId: 5,
    title: '4.4 0/1 Knapsack Problem Dynamic Programming',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/nLmhmB6NzcM',
    duration: '34:10',
    description: 'Memoization table construction, item include/exclude decision recurrence, and back-tracking chosen items.',
    keyTopics: ['DP Table V[i, w] definition', 'Include item (vᵢ + V[i-1, w-wᵢ]) vs Exclude', 'Pseudo-polynomial time O(n·W)', 'Backtracking to find item subset'],
  },

  // Module 5: Dynamic Programming II
  'matrix chain': {
    algorithmName: 'Matrix Chain Multiplication',
    moduleId: 5,
    title: '4.2 Matrix Chain Multiplication Dynamic Programming',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/prx1psByp7U',
    duration: '38:00',
    description: 'Optimal parenthesization of matrix products, cost recurrence m[i,j] = min(m[i,k] + m[k+1,j] + pᵢ₋₁pₖpⱼ), and split point table.',
    keyTopics: ['Associativity of matrix multiplication', 'Split-point k optimization', 'Diagonal tabulation order', 'Parenthesization reconstruction'],
  },
  'bellman-ford': {
    algorithmName: 'Bellman-Ford',
    moduleId: 5,
    title: '4.6 Bellman-Ford Shortest Path Algorithm',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/FtN3BYH2Zes',
    duration: '28:15',
    description: 'Single-source shortest paths on directed graphs with negative edge weights, V-1 edge relaxations, and negative cycle detection.',
    keyTopics: ['Edge relaxation formula', 'V-1 iterations sufficiency proof', 'Negative weight cycle detection pass', 'O(V·E) complexity analysis'],
  },

  // Module 6: Greedy Method I
  'job sequencing': {
    algorithmName: 'Job Sequencing with Deadlines',
    moduleId: 6,
    title: '3.3 Job Sequencing with Deadlines Greedy Algorithm',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/zPtI8q9gvX8',
    duration: '26:50',
    description: 'Profit maximization within unit-time slot deadlines, greedy choice by decreasing profit, and disjoint set optimization.',
    keyTopics: ['Decreasing profit ordering', 'Latest available slot allocation', 'Gantt chart time slots', 'O(n²) standard vs O(n log n) disjoint set'],
  },
  'fractional knapsack': {
    algorithmName: 'Fractional Knapsack',
    moduleId: 6,
    title: '3.1 Fractional Knapsack Problem Greedy Method',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/oTTzNMHM05I',
    duration: '21:30',
    description: 'Value-to-weight density sorting, greedy fractional allocation, and proof of optimality.',
    keyTopics: ['Profit-to-weight ratio pᵢ/wᵢ', 'Greedy choice property proof', 'Fractional item division', 'O(n log n) sorting bottleneck'],
  },

  // Module 7: Greedy Method II
  'kruskal': {
    algorithmName: "Kruskal's Algorithm",
    moduleId: 7,
    title: "3.5 Kruskal's Minimum Spanning Tree Algorithm",
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/4ZlRH0eK-qQ',
    duration: '32:00',
    description: 'Minimum Spanning Tree construction, ascending edge sorting, disjoint set union-find, and cycle avoidance.',
    keyTopics: ['Ascending edge weight queue', 'Disjoint Set Union-Find (DSU)', 'Path compression and union by rank', 'Cut property & matroid proof'],
  },
  'prim': {
    algorithmName: "Prim's Algorithm",
    moduleId: 7,
    title: "3.5 Prim's Algorithm for Minimum Spanning Tree",
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/4ZlRH0eK-qQ',
    duration: '29:10',
    description: 'Growing a connected component vertex-by-vertex using min-priority queues and key value updates.',
    keyTopics: ['Vertex-centric tree growth', 'Min-cut cross-edge selection', 'Min-heap priority queue implementation', 'O(E + V log V) with Fibonacci heap'],
  },
  'dijkstra': {
    algorithmName: "Dijkstra's Algorithm",
    moduleId: 7,
    title: "3.6 Dijkstra's Shortest Path Algorithm",
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/XB4MIexjvY0',
    duration: '33:45',
    description: 'Greedy single-source shortest path on non-negative weighted graphs with priority queue relaxation.',
    keyTopics: ['Distance array initialization', 'Greedy unvisited minimum vertex pick', 'Neighbor edge relaxation step', 'Non-negative weight requirement reason'],
  },

  // Module 8: Branch & Bound
  'branch and bound': {
    algorithmName: 'Branch and Bound',
    moduleId: 8,
    title: '6.1 Branch and Bound Introduction & Knapsack',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/yV1d-b_SkVA',
    duration: '35:20',
    description: 'State space search for combinatorial optimization, upper and lower bounding functions, and FIFO/LIFO/LCBB strategies.',
    keyTopics: ['Upper and lower bounding functions', 'Least-Cost Branch & Bound (LCBB)', 'Pruning subtrees worse than current best', 'State space node cost calculation'],
  },
  'traveling salesperson': {
    algorithmName: 'Travelling Salesperson (TSP)',
    moduleId: 8,
    title: '6.2 Travelling Salesperson Problem Branch and Bound',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/1FEP_sNb62k',
    duration: '42:15',
    description: 'Cost matrix row and column reduction, lower bound estimation, live state tree expansion, and tour discovery.',
    keyTopics: ['Cost matrix reduction technique', 'Row/column minimum subtraction', 'Reduced matrix cost as lower bound', 'Optimal Hamiltonian tour synthesis'],
  },

  // Module 9: P and NP Problems
  'sat': {
    algorithmName: '3-SAT & NP Verifier',
    moduleId: 9,
    title: '7.1 P and NP Problems & Determinism',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/e2UFfcqXA8A',
    duration: '30:40',
    description: 'Turing machine determinism vs non-determinism, polynomial certificate verification, and 3-SAT clause evaluation.',
    keyTopics: ['Deterministic vs Non-deterministic algorithms', 'Certificate verification in polynomial time', 'Boolean CNF clause satisfaction', 'Cook-Levin Theorem foundations'],
  },
  'p and np': {
    algorithmName: 'P vs NP Foundations',
    moduleId: 9,
    title: 'Complexity Classes: P, NP, NP-Hard & NP-Complete',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/e2UFfcqXA8A',
    duration: '36:10',
    description: 'The Millennium Prize problem, class inclusions P ⊆ NP, decision vs optimization problems, and reductions.',
    keyTopics: ['Decision problem framework', 'Polynomial-time solvability vs verifiability', 'Turing reduction concepts', 'Open questions in theoretical CS'],
  },

  // Module 10: NP-Hard & NP-Complete
  'graph coloring': {
    algorithmName: 'Graph Coloring',
    moduleId: 10,
    title: '7.3 Graph Coloring Problem (m-Coloring)',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/052VkKhIaQ4',
    duration: '27:30',
    description: 'Chromatic number χ(G), planar 4-color theorem, backtracking with pruning, and NP-completeness proof.',
    keyTopics: ['Chromatic number definition', 'Adjacency conflict verification', 'Backtracking state-space pruning', 'Reduction from 3-SAT to 3-Coloring'],
  },
  'np-complete': {
    algorithmName: 'NP-Completeness & Reductions',
    moduleId: 10,
    title: '7.4 NP-Complete and NP-Hard Reductions',
    educator: 'Abdul Bari • Algorithms',
    embedUrl: 'https://www.youtube.com/embed/e2UFfcqXA8A',
    duration: '38:50',
    description: 'Karp reductions A ≤ₚ B, proving NP-completeness through polynomial gadgets, and approximation algorithms.',
    keyTopics: ['Karp polynomial-time reduction rules', 'Cook-Levin SAT master reduction', '3-SAT to Vertex Cover to Clique', 'Approximation ratios for NP-Hard'],
  },
};

export function getLectureForAlgorithm(algoName?: string | null, moduleId?: number): VideoLectureInfo {
  if (algoName) {
    const lower = algoName.toLowerCase();
    for (const [key, lecture] of Object.entries(VIDEO_LECTURES)) {
      if (lower.includes(key) || key.includes(lower)) {
        return lecture;
      }
    }
  }

  // Fallback by moduleId if specific algorithm string wasn't matched
  const moduleFallbacks: Record<number, VideoLectureInfo> = {
    1: VIDEO_LECTURES['linear search'],
    2: VIDEO_LECTURES['merge sort'],
    3: VIDEO_LECTURES['n-queens'],
    4: VIDEO_LECTURES['floyd-warshall'],
    5: VIDEO_LECTURES['matrix chain'],
    6: VIDEO_LECTURES['job sequencing'],
    7: VIDEO_LECTURES['kruskal'],
    8: VIDEO_LECTURES['branch and bound'],
    9: VIDEO_LECTURES['sat'],
    10: VIDEO_LECTURES['graph coloring'],
  };

  if (moduleId && moduleFallbacks[moduleId]) {
    return moduleFallbacks[moduleId];
  }

  return VIDEO_LECTURES['linear search'];
}
