import { create } from 'zustand';
import type { User } from '../types';
import { getStoredToken, setStoredToken } from '../api/client';

const USER_STORAGE_KEY = 'algolens_user';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user?: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),

  login: (token: string, user: User | null = null) => {
    setStoredToken(token);
    setStoredUser(user);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    setStoredToken(null);
    setStoredUser(null);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
