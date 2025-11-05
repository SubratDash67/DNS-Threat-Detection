import apiClient from './client';

export const exportApi = {
  // Export scan history as CSV
  exportHistoryCSV: async (filters?: any): Promise<Blob> => {
    const response = await apiClient.post(
      '/api/history/export',
      { format: 'csv', ...filters },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Export scan history as JSON
  exportHistoryJSON: async (filters?: any): Promise<Blob> => {
    const response = await apiClient.post(
      '/api/history/export',
      { format: 'json', ...filters },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Export safelist as CSV
  exportSafelistCSV: async (tier?: string): Promise<Blob> => {
    const response = await apiClient.get('/api/safelist/export', {
      params: { tier },
      responseType: 'blob',
    });
    return response.data;
  },

  // Generate analytics PDF report
  generateAnalyticsReport: async (params: {
    start_date?: string;
    end_date?: string;
    include_charts?: boolean;
  }): Promise<Blob> => {
    const response = await apiClient.post('/api/analytics/report', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download file helper
  downloadFile: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
