// Generic Visualization Trace & Module 1 Step Contracts

export interface VisualizationTrace<TStep = unknown, TMetrics = Record<string, number | string>> {
  steps: TStep[];
  comparisons: number;
  result_index: number;
  metrics?: TMetrics;
}

// Module 1 Specific Types
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
