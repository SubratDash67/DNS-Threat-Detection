import apiClient from './client';
import { ScanResult, HistoryFilter } from './types';

export const historyApi = {
  // Get scan history with filters
  getHistory: async (filters?: HistoryFilter): Promise<ScanResult[]> => {
    const response = await apiClient.get('/api/history', {
      params: filters,
    });
    return response.data;
  },

  // Get specific scan by ID
  getScan: async (scanId: number): Promise<ScanResult> => {
    const response = await apiClient.get(`/api/history/${scanId}`);
    return response.data;
  },

  // Delete scan
  deleteScan: async (scanId: number): Promise<void> => {
    await apiClient.delete(`/api/history/${scanId}`);
  },

  // Export history
  exportHistory: async (format: 'csv' | 'json', filters?: HistoryFilter): Promise<Blob> => {
    const response = await apiClient.post(
      '/api/history/export',
      { format, ...filters },
      { responseType: 'blob' }
    );
    return response.data;
  },
};
