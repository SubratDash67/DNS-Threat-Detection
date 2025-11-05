import apiClient from './client';
import { DashboardStats, TrendData, TLDAnalysis, HeatmapData } from './types';

export const analyticsApi = {
  // Get dashboard statistics
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/analytics/dashboard');
    return response.data;
  },

  // Get scan trends
  getTrends: async (days: number = 30): Promise<TrendData[]> => {
    const response = await apiClient.get('/api/analytics/trends', {
      params: { days },
    });
    return response.data;
  },

  // Get TLD analysis
  getTLDAnalysis: async (): Promise<TLDAnalysis[]> => {
    const response = await apiClient.get('/api/analytics/tld-analysis');
    return response.data;
  },

  // Get activity heatmap
  getHeatmap: async (): Promise<HeatmapData[]> => {
    const response = await apiClient.get('/api/analytics/heatmap');
    return response.data;
  },
};
