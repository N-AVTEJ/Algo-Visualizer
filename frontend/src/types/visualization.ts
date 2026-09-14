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

// ============================================================================
// Module 5 Types (Dynamic Programming II: 0/1 Knapsack)
// ============================================================================
export interface KnapsackItem {
  id: string;
  weight: number;
  value: number;
}

export type Module5Phase = 'init' | 'table_fill' | 'backtrack' | 'completed';

export interface Module5Step {
  phase: Module5Phase;
  row: number;
  col: number;
  item_index: number | null;
  item_weight: number | null;
  item_value: number | null;
  prev_dp: number | null;
  candidate_val: number | null;
  result_val: number;
  included: boolean;
  dp_table: number[][];
  selected_items: number[];
  running_weight: number;
  running_value: number;
  next_row?: number;
  next_col?: number;
  explanation: string;
  metrics: {
    max_value: number;
    selected_count: number;
    total_weight: number;
    total_value: number;
    current_step: number;
  };
}

export interface Module5RunRequest {
  items?: KnapsackItem[];
  capacity?: number;
}

export interface Module5RunResponse {
  steps: Module5Step[];
  max_value: number;
  selected_items: number[];
  total_weight: number;
  total_value: number;
  dp_table: number[][];
  items: KnapsackItem[];
  capacity: number;
  metrics: {
    items_count: number;
    capacity: number;
    max_value: number;
    selected_count: number;
    total_weight: number;
    total_value: number;
    total_steps: number;
  };
}

// ============================================================================
// Module 6 Types (Greedy Method I: Job Sequencing)
// ============================================================================
export interface JobItem {
  id: string;
  deadline: number;
  profit: number;
}

export type Module6Action =
  'init' | 'sorted' | 'considering' | 'checking_slot' | 'assigned' | 'rejected' | 'completed';

export interface TimelineSlot {
  slot: number;
  job_id: string | null;
}

export interface Module6Step {
  action: Module6Action;
  job: JobItem | null;
  checked_slot: number | null;
  timeline: TimelineSlot[];
  running_profit: number;
  scheduled_jobs: string[];
  rejected_jobs: string[];
  sorted_jobs: JobItem[];
  explanation: string;
  metrics: {
    total_profit: number;
    scheduled_count: number;
    available_slots: number;
    current_step: number;
  };
}

export interface Module6RunRequest {
  jobs?: JobItem[];
  max_slots?: number;
}

export interface Module6RunResponse {
  steps: Module6Step[];
  scheduled_jobs: string[];
  timeline: TimelineSlot[];
  total_profit: number;
  max_slots: number;
  sorted_jobs: JobItem[];
  metrics: {
    total_jobs: number;
    scheduled_count: number;
    rejected_count: number;
    total_profit: number;
    slots_utilized: number;
    total_slots: number;
    total_steps: number;
  };
}

// ============================================================================
// Module 7 Types (Greedy Method II: Kruskal's MST)
// ============================================================================
export interface GraphEdge {
  u: string;
  v: string;
  weight: number;
  id?: string;
}

export type Module7Action =
  'init' | 'sorted_edges' | 'checking' | 'added' | 'rejected' | 'completed';

export interface Module7Step {
  action: Module7Action;
  current_edge: GraphEdge | null;
  mst_edges: GraphEdge[];
  rejected_edges: GraphEdge[];
  running_weight: number;
  components: string[][];
  is_cycle: boolean;
  sorted_edges: GraphEdge[];
  explanation: string;
  metrics: {
    total_weight: number;
    mst_edge_count: number;
    edges_considered: number;
    components_count: number;
    current_step: number;
  };
}

export interface Module7RunRequest {
  vertices?: string[];
  edges?: GraphEdge[];
}

export interface Module7RunResponse {
  steps: Module7Step[];
  mst_edges: GraphEdge[];
  rejected_edges: GraphEdge[];
  total_weight: number;
  is_connected: boolean;
  vertices: string[];
  edges: GraphEdge[];
  sorted_edges: GraphEdge[];
  metrics: {
    vertices_count: number;
    edges_considered: number;
    mst_edge_count: number;
    total_mst_weight: number;
    is_connected: boolean;
    final_components_count: number;
    total_steps: number;
  };
}
