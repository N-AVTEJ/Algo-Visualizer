import { create } from 'zustand';
import { progressApi, getStoredToken } from '../api/client';
import type { UserProgress } from '../types';

const LOCAL_PROGRESS_KEY = 'algolens_guest_progress';

function loadGuestProgress(): Record<number, UserProgress> {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveGuestProgress(map: Record<number, UserProgress>): void {
  try {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // Ignore localStorage errors
  }
}

interface ProgressState {
  progressMap: Record<number, UserProgress>;
  loading: boolean;
  error: string | null;
  fetchProgress: () => Promise<void>;
  recordCompletion: (
    algorithmId: number,
    score?: number,
    timeSpent?: number
  ) => Promise<UserProgress | null>;
  isCompleted: (algorithmId: number) => boolean;
  getCompletedCount: () => number;
  getModuleCompletedCount: (algorithmIds: number[]) => number;
  isModuleCompleted: (algorithmIds: number[]) => boolean;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: loadGuestProgress(),
  loading: false,
  error: null,

  fetchProgress: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ progressMap: loadGuestProgress(), loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const records = await progressApi.getMyProgress();
      const map: Record<number, UserProgress> = {};
      for (const rec of records) {
        map[rec.algorithm_id] = rec;
      }
      set({ progressMap: map, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch progress';
      set({ error: msg, loading: false });
    }
  },

  recordCompletion: async (algorithmId: number, score = 100, timeSpent = 30) => {
    const token = getStoredToken();
    const now = new Date().toISOString();

    const localRecord: UserProgress = {
      id: algorithmId,
      user_id: 0,
      algorithm_id: algorithmId,
      completed: true,
      score,
      time_spent: timeSpent,
      completed_at: now,
    };

    if (!token) {
      const current = { ...get().progressMap, [algorithmId]: localRecord };
      saveGuestProgress(current);
      set({ progressMap: current });
      return localRecord;
    }

    try {
      const saved = await progressApi.saveProgress({
        algorithm_id: algorithmId,
        completed: true,
        score,
        time_spent: timeSpent,
      });
      const updated = { ...get().progressMap, [algorithmId]: saved };
      set({ progressMap: updated });
      return saved;
    } catch (err: unknown) {
      // Optimistic fallback to local store
      const current = { ...get().progressMap, [algorithmId]: localRecord };
      saveGuestProgress(current);
      set({ progressMap: current });
      return localRecord;
    }
  },

  isCompleted: (algorithmId: number) => {
    const rec = get().progressMap[algorithmId];
    return Boolean(rec?.completed);
  },

  getCompletedCount: () => {
    return Object.values(get().progressMap).filter((r) => r.completed).length;
  },

  getModuleCompletedCount: (algorithmIds: number[]) => {
    if (!algorithmIds || algorithmIds.length === 0) return 0;
    const { progressMap } = get();
    return algorithmIds.filter((id) => progressMap[id]?.completed).length;
  },

  isModuleCompleted: (algorithmIds: number[]) => {
    if (!algorithmIds || algorithmIds.length === 0) return false;
    const { progressMap } = get();
    return algorithmIds.every((id) => progressMap[id]?.completed);
  },
}));
