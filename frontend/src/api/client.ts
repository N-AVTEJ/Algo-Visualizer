// Reusable API client for AlgoLens Pro
import type {
  Algorithm,
  HealthResponse,
  LoginCredentials,
  Module,
  RegisterCredentials,
  TokenResponse,
  User,
  UserProgress,
  UserProgressCreate,
  Module1RunRequest,
  Module1Trace,
} from '../types';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const TOKEN_KEY = 'algolens_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // LocalStorage might be disabled/unavailable in some private environments
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = false, headers = {}, ...restOptions } = options;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const token = getStoredToken();
  if (token) {
    (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  } else if (requiresAuth) {
    throw new ApiError('Authentication required but no token found', 401);
  }

  const response = await fetch(url, {
    headers: requestHeaders,
    ...restOptions,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData: unknown = null;

    try {
      const parsed = await response.json();
      errorData = parsed;
      if (typeof parsed.detail === 'string') {
        errorMessage = parsed.detail;
      } else if (Array.isArray(parsed.detail)) {
        errorMessage = parsed.detail
          .map((d: { msg?: string }) => d.msg || 'Validation error')
          .join(', ');
      }
    } catch {
      // Non-JSON response body
    }

    if (response.status === 401) {
      // Clear potentially invalid/stale token on 401 Unauthorized
      setStoredToken(null);
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Authentication API
export const authApi = {
  register: (credentials: RegisterCredentials): Promise<User> =>
    apiClient<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  login: (credentials: LoginCredentials): Promise<TokenResponse> =>
    apiClient<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// Curriculum Modules API
export const modulesApi = {
  list: (): Promise<Module[]> => apiClient<Module[]>('/modules'),

  getById: (id: number | string): Promise<Module> => apiClient<Module>(`/modules/${id}`),
};

// Algorithms API
export const algorithmsApi = {
  list: (moduleId?: number | string): Promise<Algorithm[]> => {
    const query = moduleId ? `?module_id=${moduleId}` : '';
    return apiClient<Algorithm[]>(`/algorithms${query}`);
  },

  getById: (id: number | string): Promise<Algorithm> => apiClient<Algorithm>(`/algorithms/${id}`),

  runModule1: (data: Module1RunRequest): Promise<Module1Trace> =>
    apiClient<Module1Trace>('/algorithms/module1/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// User Progress API
export const progressApi = {
  getMyProgress: (): Promise<UserProgress[]> =>
    apiClient<UserProgress[]>('/progress/me', { requiresAuth: true }),

  saveProgress: (data: UserProgressCreate): Promise<UserProgress> =>
    apiClient<UserProgress>('/progress', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),
};

// Server Health check
export async function checkHealth(): Promise<HealthResponse> {
  // Base root health check URL (strip /api suffix if present)
  const rootUrl = API_BASE_URL.replace(/\/api$/, '');
  const response = await fetch(`${rootUrl}/health`);
  if (!response.ok) {
    throw new ApiError(`Health check failed with status ${response.status}`, response.status);
  }
  return response.json();
}
