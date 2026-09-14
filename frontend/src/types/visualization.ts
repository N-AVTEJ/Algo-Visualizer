// Generic Visualization Trace & Module 1-4 Step Contracts

export type MetricValue = number | string | boolean;

export interface VisualizationTrace<
  TStep = unknown,
  TMetrics extends Record<string, MetricValue> = Record<string, MetricValue>,
> {
  steps: TStep[];
  comparisons?: number;
  result_index?: number;
  metrics?: TMetrics;
}

// ============================================================================
// Module 1 Types (Linear & Binary Search)
// ============================================================================
export interface Module1Step {
  index: number;
  value: number;
  action: string;
  found: boolean;
  comparisons: number;
  left?: number;
  right?: number;
  mid?: number;
}

export type Module1AlgorithmType = 'linear' | 'binary';

export interface Module1RunRequest {
  array: number[];
  target: number;
  algorithm: Module1AlgorithmType;
}

export type Module1Trace = VisualizationTrace<Module1Step>;

// ============================================================================
// Module 2 Types (Divide & Conquer: Merge Sort & Quick Sort)
// ============================================================================
export type Module2Action =
  | 'init'
  | 'split'
  | 'base_case'
  | 'merge_compare'
  | 'merge_place'
  | 'merged'
  | 'pivot_select'
  | 'compare'
  | 'swap'
  | 'pivot_place'
  | 'partition_start'
  | 'partition_end'
  | 'completed';

export interface Module2Step {
  action: Module2Action;
  array: number[];
  left: number;
  right: number;
  mid?: number;
  depth: number;
  comparisons: number;
  swaps?: number;
  node_id?: string;
  parent_id?: string | null;
  left_child?: string;
  right_child?: string;
  sub_array?: number[];
  comparing?: [number, number];
  indices?: [number, number];
  placed_index?: number;
  placed_value?: number;
  pivot_index?: number | null;
  pivot_value?: number | null;
  i?: number;
  j?: number;
  swapped?: [number, number];
}

export type Module2AlgorithmType = 'merge_sort' | 'quick_sort';

export interface Module2RunRequest {
  array: number[];
  algorithm: Module2AlgorithmType;
}

export interface Module2RunResponse {
  steps: Module2Step[];
  comparisons: number;
  swaps?: number;
  result_array: number[];
  metrics: {
    comparisons: number;
    swaps?: number;
    max_depth: number;
    total_steps: number;
  };
}

// ============================================================================
// Module 3 Types (Backtracking: N-Queens)
// ============================================================================
export interface ConflictDetail {
  row: number;
  col: number;
  type: 'column' | 'diagonal';
  reason: string;
}

export type Module3Action = 'init' | 'conflict' | 'place' | 'backtrack' | 'solution';

export interface Module3Step {
  action: Module3Action;
  row: number;
  col: number;
  board: number[]; // queens[r] = col (-1 if unplaced)
  depth: number;
  node_id: string;
  parent_id?: string | null;
  tree_status: 'exploring' | 'conflict' | 'placed' | 'backtracked' | 'solution';
  conflict_with?: ConflictDetail | null;
  metrics: {
    attempts: number;
    placements: number;
    backtracks: number;
    solutions: number;
  };
}

export interface Module3RunRequest {
  n?: number;
  stop_at_first_solution?: boolean;
}

export interface Module3RunResponse {
  steps: Module3Step[];
  n: number;
  solutions: number[][];
  total_solutions: number;
  metrics: {
    attempts: number;
    placements: number;
    backtracks: number;
    solutions: number;
    max_depth: number;
    total_steps: number;
  };
}

// ============================================================================
// Module 4 Types (Dynamic Programming I: Floyd-Warshall)
// ============================================================================
export type Module4Action = 'init' | 'relax' | 'completed';

export interface Module4Step {
  action: Module4Action;
  k: number;
  i: number;
  j: number;
  prev_dist: number | null;
  dist_ik: number | null;
  dist_kj: number | null;
  candidate_dist: number | null;
  updated: boolean;
  new_dist: number | null;
  matrix: (number | null)[][];
  explanation: string;
  metrics: {
    relaxations: number;
    updates: number;
    current_k: number;
  };
}

export interface Module4RunRequest {
  matrix?: (number | null)[][] | null;
  labels?: string[] | null;
}

export interface Module4RunResponse {
  steps: Module4Step[];
  initial_matrix: (number | null)[][];
  final_matrix: (number | null)[][];
  labels: string[];
  metrics: {
    vertices: number;
    total_relaxations: number;
    total_updates: number;
    total_steps: number;
  };
}
