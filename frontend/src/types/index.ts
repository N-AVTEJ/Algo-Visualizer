// AlgoLens Pro Type Definitions

export interface HealthResponse {
  status: string;
}

export interface User {
  id: number;
  email: string;
  role: 'student' | 'teacher' | 'admin' | string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface Module {
  id: number;
  name: string;
  description: string | null;
  order_index: number;
}

export interface Algorithm {
  id: number;
  module_id: number;
  name: string;
  code: string | null;
  time_complexity: string | null;
  space_complexity: string | null;
  video_url: string | null;
}

export interface UserProgress {
  id: number;
  user_id: number;
  algorithm_id: number;
  completed: boolean;
  score: number | null;
  time_spent: number;
  completed_at: string | null;
}

export interface UserProgressCreate {
  algorithm_id: number;
  completed?: boolean;
  score?: number;
  time_spent?: number;
}

export * from './visualization';
