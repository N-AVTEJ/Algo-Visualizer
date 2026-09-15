export interface QuizQuestion {
  id: string;
  moduleId: number;
  moduleName: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // -------------------------------------------------------------------------
  // Module 1 — Algorithm Analysis & Searching
  // -------------------------------------------------------------------------
  {
    id: 'm1-q1',
    moduleId: 1,
    moduleName: 'Algorithm Analysis & Searching',
    question: 'What is the primary prerequisite for applying Binary Search on an array?',
    options: [
      'The array elements must all be non-negative integers.',
      'The array must be strictly sorted in ascending or descending order.',
      'The array length must be a power of two.',
      'The array must not contain duplicate values.',
    ],
    correctIndex: 1,
    explanation:
      'Binary search relies on the monotonic property of sorted elements to eliminate half of the remaining search space in O(1) comparison time per iteration, yielding O(log n) total time.',
    difficulty: 'Beginner',
  },
  {
    id: 'm1-q2',
    moduleId: 1,
    moduleName: 'Algorithm Analysis & Searching',
    question: 'In the worst-case scenario, what is the ratio of comparisons performed by Linear Search versus Binary Search on an array of size n = 1024?',
    options: [
      '1024 to 512 (2x)',
      '1024 to 10 (~102x)',
      '1024 to 1 (1024x)',
      '1024 to 1024 (1x)',
    ],
    correctIndex: 1,
    explanation:
      'Linear Search checks all n = 1024 elements in the worst case (O(n)). Binary Search checks at most log₂(1024) + 1 = 11 elements (O(log n)), giving a ~100x reduction in comparisons.',
    difficulty: 'Intermediate',
  },

  // -------------------------------------------------------------------------
  // Module 2 — Divide & Conquer
  // -------------------------------------------------------------------------
  {
    id: 'm2-q1',
    moduleId: 2,
    moduleName: 'Divide & Conquer',
    question: 'What recurrence relation describes Merge Sort, and what is its solution by the Master Theorem?',
    options: [
      'T(n) = 2T(n/2) + O(1) => O(n)',
      'T(n) = 2T(n/2) + O(n) => O(n log n)',
      'T(n) = T(n-1) + O(n) => O(n²)',
      'T(n) = 4T(n/2) + O(n) => O(n²)',
    ],
    correctIndex: 1,
    explanation:
      'Merge Sort divides the array into 2 halves of size n/2 and merges them in linear O(n) time. By Master Theorem Case 2 (a=2, b=2, c=1), T(n) = Θ(n log n).',
    difficulty: 'Intermediate',
  },
  {
    id: 'm2-q2',
    moduleId: 2,
    moduleName: 'Divide & Conquer',
    question: 'Under what input condition does Lomuto partition Quick Sort degrade to O(n²) worst-case time complexity?',
    options: [
      'When the array contains completely random uniform values.',
      'When the input array is already sorted and the pivot is chosen as the last element.',
      'When the array size is a prime number.',
      'When elements are all distinct and in reverse order with a median-of-three pivot.',
    ],
    correctIndex: 1,
    explanation:
      'If the array is already sorted and the rightmost element is picked as pivot, the partition produces highly unbalanced subproblems of size 0 and n-1 at each level, yielding O(n²) time.',
    difficulty: 'Intermediate',
  },

  // -------------------------------------------------------------------------
  // Module 3 — Backtracking
  // -------------------------------------------------------------------------
  {
    id: 'm3-q1',
    moduleId: 3,
    moduleName: 'Backtracking',
    question: 'How do you check in O(1) time whether a queen placed at (row, col) conflicts along any diagonal with existing queens?',
    options: [
      'Check if row + col and row - col have already been occupied in hash sets or boolean arrays.',
      'Iterate over all rows from 0 to N and compute the slope.',
      'Compute the determinant of the NxN chessboard matrix.',
      'Calculate the Euclidean distance between all pairs of queens.',
    ],
    correctIndex: 0,
    explanation:
      'Major diagonals have constant (row - col + N - 1) and anti-diagonals have constant (row + col). Tracking these in boolean arrays allows O(1) safety validation.',
    difficulty: 'Intermediate',
  },
  {
    id: 'm3-q2',
    moduleId: 3,
    moduleName: 'Backtracking',
    question: 'How many distinct solutions exist for the standard 8-Queens problem on an 8x8 chessboard?',
    options: ['8', '12', '92', '256'],
    correctIndex: 2,
    explanation:
      'There are exactly 92 distinct solutions to the 8-Queens problem (or 12 fundamental solutions taking rotations and reflections into account).',
    difficulty: 'Beginner',
  },

  // -------------------------------------------------------------------------
  // Module 4 — Dynamic Programming I: Floyd-Warshall
  // -------------------------------------------------------------------------
  {
    id: 'm4-q1',
    moduleId: 4,
    moduleName: 'Dynamic Programming I',
    question: 'What is the dynamic programming state recurrence for the Floyd-Warshall all-pairs shortest path algorithm?',
    options: [
      'dist[i][j] = dist[i][k] * dist[k][j]',
      'dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])',
      'dist[i][j] = max(dist[i][j], dist[i][k] - dist[k][j])',
      'dist[i][j] = dist[i][j] + min(dist[i][k], dist[k][j])',
    ],
    correctIndex: 1,
    explanation:
      'For each intermediate vertex k (1..V), Floyd-Warshall considers whether the shortest path from i to j improves by passing through vertex k: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).',
    difficulty: 'Intermediate',
  },
  {
    id: 'm4-q2',
    moduleId: 4,
    moduleName: 'Dynamic Programming I',
    question: 'What will happen if Floyd-Warshall is run on a graph containing a negative-weight cycle?',
    options: [
      'The algorithm will encounter an infinite loop.',
      'The diagonal elements dist[i][i] will become negative for vertices involved in the cycle.',
      'The algorithm automatically converges to the absolute values of the edge weights.',
      'The matrix values overflow to NaN on the first outer iteration.',
    ],
    correctIndex: 1,
    explanation:
      'A negative value on the main diagonal (dist[i][i] < 0) after execution signifies that a path from vertex i back to itself has negative cost, identifying a negative cycle.',
    difficulty: 'Advanced',
  },

  // -------------------------------------------------------------------------
  // Module 5 — Dynamic Programming II: 0/1 Knapsack
  // -------------------------------------------------------------------------
  {
    id: 'm5-q1',
    moduleId: 5,
    moduleName: 'Dynamic Programming II',
    question: 'Why does the greedy strategy by value-to-weight ratio fail for the 0/1 Knapsack problem?',
    options: [
      'Because items cannot be subdivided, leaving unused capacity that could have accommodated higher-value combinations.',
      'Because the value-to-weight ratio cannot be computed in polynomial time.',
      'Because negative values are not allowed in the knapsack formulation.',
      'Because the greedy approach requires O(N!) sorting time.',
    ],
    correctIndex: 0,
    explanation:
      '0/1 Knapsack requires whole item inclusion. A greedy choice might leave fractional gaps that prevent a more optimal total combination, unlike Fractional Knapsack where greedy is optimal.',
    difficulty: 'Intermediate',
  },
  {
    id: 'm5-q2',
    moduleId: 5,
    moduleName: 'Dynamic Programming II',
    question: 'What is the optimized 1D space complexity for the 0/1 Knapsack problem with N items and capacity W?',
    options: ['O(N)', 'O(W)', 'O(N * W)', 'O(log W)'],
    correctIndex: 1,
    explanation:
      'By iterating the capacity w backwards from W down to weight[i], the DP table can be compressed into a single 1D array of size O(W), as dp[w] only depends on states from the previous item (dp[w - weight[i]]).',
    difficulty: 'Intermediate',
  },

  // -------------------------------------------------------------------------
  // Module 6 — Greedy Algorithms: Job Sequencing
  // -------------------------------------------------------------------------
  {
    id: 'm6-q1',
    moduleId: 6,
    moduleName: 'Greedy Algorithms',
    question: 'In Job Sequencing with Deadlines, what is the greedy choice criteria to maximize profit?',
    options: [
      'Sort jobs by earliest deadline first, schedule in the earliest available slot.',
      'Sort jobs by profit in descending order, schedule each in the latest available slot before its deadline.',
      'Sort jobs by shortest processing time first.',
      'Sort jobs alphabetically by job ID.',
    ],
    correctIndex: 1,
    explanation:
      'Prioritizing highest profit first and placing the job as late as possible (latest slot <= deadline) preserves earlier slots for jobs with tighter deadlines.',
    difficulty: 'Intermediate',
  },
  {
    id: 'm6-q2',
    moduleId: 6,
    moduleName: 'Greedy Algorithms',
    question: 'How can the slot-finding step in Job Sequencing be optimized from O(n²) to nearly O(n log n)?',
    options: [
      'Using a Disjoint Set Union (DSU / Union-Find) data structure to find the latest available parent slot in O(α(n)).',
      'Using Floyd-Warshall matrix multiplication.',
      'Using a 2D dynamic programming grid.',
      'Using a hash table with quadratic probing.',
    ],
    correctIndex: 0,
    explanation:
      'With DSU, each slot points to the nearest free slot to its left. When slot t is occupied, it is unioned with slot t-1, making find(t) take nearly O(1) time.',
    difficulty: 'Advanced',
  },

  // -------------------------------------------------------------------------
  // Module 7 — Graph Algorithms: Kruskal MST
  // -------------------------------------------------------------------------
  {
    id: 'm7-q1',
    moduleId: 7,
    moduleName: 'Graph Algorithms',
    question: 'What is the dominant operation determining the time complexity of Kruskal’s Minimum Spanning Tree algorithm?',
    options: [
      'Sorting the E edges by weight: O(E log E).',
      'Finding the root of vertices in DSU: O(V²).',
      'Computing the graph adjacency matrix.',
      'Traversing the MST with Breadth-First Search.',
    ],
    correctIndex: 0,
    explanation:
      'Sorting E edges takes O(E log E). The union-find operations take O(E · α(V)), which is virtually linear, so edge sorting dominates the O(E log E) complexity.',
    difficulty: 'Intermediate',
  },
  {
    id: 'm7-q2',
    moduleId: 7,
    moduleName: 'Graph Algorithms',
    question: 'How many edges are present in a valid Minimum Spanning Tree for a connected, undirected graph with V vertices?',
    options: ['V', 'V - 1', 'V + 1', 'E - V'],
    correctIndex: 1,
    explanation:
      'A tree spanning V vertices must have exactly V - 1 edges and no cycles.',
    difficulty: 'Beginner',
  },

  // -------------------------------------------------------------------------
  // Module 8 — Branch & Bound
  // -------------------------------------------------------------------------
  {
    id: 'm8-q1',
    moduleId: 8,
    moduleName: 'Branch & Bound',
    question: 'How does Branch & Bound calculate the upper bound (UB) at each node for 0/1 Knapsack?',
    options: [
      'By solving the Fractional Knapsack relaxation greedily on remaining items.',
      'By taking the sum of all item values regardless of weight.',
      'By multiplying the remaining capacity by the minimum item value.',
      'By running Dijkstra algorithm on the state tree.',
    ],
    correctIndex: 0,
    explanation:
      'The upper bound uses linear programming relaxation (Fractional Knapsack) on the remaining items sorted by value/weight ratio. This provides an admissible upper bound on any achievable integer solution in that subtree.',
    difficulty: 'Advanced',
  },
  {
    id: 'm8-q2',
    moduleId: 8,
    moduleName: 'Branch & Bound',
    question: 'When does Branch & Bound prune (kill) an active branch in a maximization problem?',
    options: [
      'When the node’s upper bound is less than or equal to the best integer solution found so far (UB <= max_profit).',
      'When the node depth exceeds 3.',
      'When the node has more than two children.',
      'When the weight becomes exactly equal to zero.',
    ],
    correctIndex: 0,
    explanation:
      'If the optimistic upper bound achievable from a subtree cannot surpass the currently known best solution (UB <= max_profit), no descendant can be optimal, so the branch is pruned.',
    difficulty: 'Intermediate',
  },

  // -------------------------------------------------------------------------
  // Module 9 — NP-Completeness & SAT
  // -------------------------------------------------------------------------
  {
    id: 'm9-q1',
    moduleId: 9,
    moduleName: 'NP-Completeness & SAT',
    question: 'What historical milestone in theoretical computer science was established by the Cook-Levin Theorem (1971)?',
    options: [
      'Proving that Boolean Satisfiability (SAT) is NP-Complete.',
      'Proving that P = NP.',
      'Proving that Quick Sort is optimal among comparison sorts.',
      'Proving that all graph problems are polynomial time solvable.',
    ],
    correctIndex: 0,
    explanation:
      'The Cook-Levin theorem proved that SAT is NP-Complete by showing that any language in NP can be polynomial-time reduced to SAT.',
    difficulty: 'Intermediate',
  },
  {
    id: 'm9-q2',
    moduleId: 9,
    moduleName: 'NP-Completeness & SAT',
    question: 'For a CNF formula with n boolean variables, how many candidate truth assignments exist in the brute-force search space?',
    options: ['n²', '2ⁿ', 'n!', 'log₂(n)'],
    correctIndex: 1,
    explanation:
      'Each of the n variables can independently be set to True or False, yielding exactly 2ⁿ possible assignments.',
    difficulty: 'Beginner',
  },

  // -------------------------------------------------------------------------
  // Module 10 — Graph Coloring
  // -------------------------------------------------------------------------
  {
    id: 'm10-q1',
    moduleId: 10,
    moduleName: 'Graph Coloring',
    question: 'What does the famous Four Color Theorem prove about planar graphs?',
    options: [
      'Every planar graph can be vertex-colored using at most 4 colors such that no adjacent vertices share a color.',
      'Planar graphs always have a chromatic number of exactly 4.',
      'Only 4-regular planar graphs have valid colorings.',
      'Planar graphs with 4 vertices cannot have cycles.',
    ],
    correctIndex: 0,
    explanation:
      'The Four Color Theorem (proven with computer assistance by Appel & Haken in 1976) guarantees that the chromatic number χ(G) <= 4 for every planar graph.',
    difficulty: 'Intermediate',
  },
  {
    id: 'm10-q2',
    moduleId: 10,
    moduleName: 'Graph Coloring',
    question: 'A graph is 2-colorable (chromatic number χ(G) <= 2) if and only if it satisfies which graph property?',
    options: [
      'The graph is bipartite (contains no odd-length cycles).',
      'The graph is complete (K_n).',
      'The graph has an Eulerian circuit.',
      'Every vertex has an even degree.',
    ],
    correctIndex: 0,
    explanation:
      'A graph is 2-colorable if and only if it is bipartite, meaning its vertices can be partitioned into two independent sets with all edges running between sets.',
    difficulty: 'Beginner',
  },
];
