// Type definitions
export interface HealthResponse {
  status: string;
  service?: string;
}

export type AlgorithmCategory = 'sorting' | 'searching' | 'graph' | 'tree' | 'dp';

export interface AlgorithmMeta {
  id: string;
  name: string;
  category: AlgorithmCategory;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
}
