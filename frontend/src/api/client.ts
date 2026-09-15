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
  Module2RunRequest,
  Module2RunResponse,
  Module3RunRequest,
  Module3RunResponse,
  Module4RunRequest,
  Module4RunResponse,
  Module5RunRequest,
  Module5RunResponse,
  Module6RunRequest,
  Module6RunResponse,
  Module7RunRequest,
  Module7RunResponse,
  Module8RunRequest,
  Module8RunResponse,
  Module9RunRequest,
  Module9RunResponse,
  Module10RunRequest,
  Module10RunResponse,
  AskRequest,
  AskResponse,
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

  runModule2: (data: Module2RunRequest): Promise<Module2RunResponse> =>
    apiClient<Module2RunResponse>('/algorithms/module2/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runModule3: (data: Module3RunRequest): Promise<Module3RunResponse> =>
    apiClient<Module3RunResponse>('/algorithms/module3/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runModule4: (data: Module4RunRequest): Promise<Module4RunResponse> =>
    apiClient<Module4RunResponse>('/algorithms/module4/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runModule5: (data: Module5RunRequest): Promise<Module5RunResponse> =>
    apiClient<Module5RunResponse>('/algorithms/module5/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runModule6: (data: Module6RunRequest): Promise<Module6RunResponse> =>
    apiClient<Module6RunResponse>('/algorithms/module6/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runModule7: (data: Module7RunRequest): Promise<Module7RunResponse> =>
    apiClient<Module7RunResponse>('/algorithms/module7/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runModule8: (data: Module8RunRequest): Promise<Module8RunResponse> =>
    apiClient<Module8RunResponse>('/algorithms/module8/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runModule9: (data: Module9RunRequest): Promise<Module9RunResponse> =>
    apiClient<Module9RunResponse>('/algorithms/module9/run', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runModule10: (data: Module10RunRequest): Promise<Module10RunResponse> =>
    apiClient<Module10RunResponse>('/algorithms/module10/run', {
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

// AI Assistant API (Phase 10)
export const aiApi = {
  ask: (data: AskRequest): Promise<AskResponse> =>
    apiClient<AskResponse>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    }),
};
