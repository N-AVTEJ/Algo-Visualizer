import { create } from 'zustand';
import type { Algorithm, Module } from '../types';

export interface ModuleState {
  modules: Module[];
  currentModule: Module | null;
  currentAlgorithm: Algorithm | null;
  setModules: (modules: Module[]) => void;
  setCurrentModule: (module: Module | null) => void;
  setCurrentAlgorithm: (algorithm: Algorithm | null) => void;
  reset: () => void;
}

export const useModuleStore = create<ModuleState>((set) => ({
  modules: [],
  currentModule: null,
  currentAlgorithm: null,

  setModules: (modules: Module[]) => set({ modules }),

  setCurrentModule: (module: Module | null) =>
    set({
      currentModule: module,
      // If module changed, optionally reset currentAlgorithm unless already matching
      currentAlgorithm: null,
    }),

  setCurrentAlgorithm: (algorithm: Algorithm | null) => set({ currentAlgorithm: algorithm }),

  reset: () =>
    set({
      modules: [],
      currentModule: null,
      currentAlgorithm: null,
    }),
}));
