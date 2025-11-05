import { create } from 'zustand';
import { BatchJob, ScanResult } from '@/api/types';

interface BatchState {
  currentJob: BatchJob | null;
  results: ScanResult[];
  isProcessing: boolean;

  // Actions
  setCurrentJob: (job: BatchJob | null) => void;
  updateProgress: (progress: Partial<BatchJob>) => void;
  addResult: (result: ScanResult) => void;
  setResults: (results: ScanResult[]) => void;
  clearBatch: () => void;
}

export const useBatchStore = create<BatchState>((set) => ({
  currentJob: null,
  results: [],
  isProcessing: false,

  setCurrentJob: (job) =>
    set({
      currentJob: job,
      isProcessing: job?.status === 'processing' || job?.status === 'pending',
    }),

  updateProgress: (progress) =>
    set((state) => ({
      currentJob: state.currentJob
        ? { ...state.currentJob, ...progress }
        : null,
      isProcessing:
        progress.status === 'processing' || progress.status === 'pending',
    })),

  addResult: (result) =>
    set((state) => ({
      results: [...state.results, result],
    })),

  setResults: (results) => set({ results }),

  clearBatch: () =>
    set({
      currentJob: null,
      results: [],
      isProcessing: false,
    }),
}));
