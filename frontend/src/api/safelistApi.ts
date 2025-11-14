import apiClient from './client';
import { SafelistDomain, SafelistStats } from './types';

export const safelistApi = {
  // Get safelist domains
  getDomains: async (
    tier?: string,
    search?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<SafelistDomain[]> => {
    const response = await apiClient.get('/api/safelist', {
      params: {
        tier,
        search,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  },

  // Add domain to safelist
  addDomain: async (data: {
    domain: string;
    tier: 'tier1' | 'tier2' | 'tier3';
    notes?: string;
  }): Promise<SafelistDomain> => {
    const response = await apiClient.post('/api/safelist', data);
    return response.data;
  },

  // Update safelist domain
  updateDomain: async (
    domainId: number,
    data: { tier?: string; notes?: string }
  ): Promise<SafelistDomain> => {
    const response = await apiClient.put(`/api/safelist/${domainId}`, data);
    return response.data;
  },

  // Delete safelist domain
  deleteDomain: async (domainId: number): Promise<void> => {
    await apiClient.delete(`/api/safelist/${domainId}`);
  },

  // Bulk import domains
  bulkImport: async (data: {
    domains: string[];
    tier: 'tier1' | 'tier2' | 'tier3';
    source: 'system' | 'user';
  }): Promise<{ added: number; skipped: number; total: number }> => {
    const response = await apiClient.post('/api/safelist/import', data);
    return response.data;
  },

  // Export safelist
  exportSafelist: async (tier?: string): Promise<Blob> => {
    const response = await apiClient.get('/api/safelist/export', {
      params: { tier },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get safelist statistics
  getStats: async (): Promise<SafelistStats> => {
    const response = await apiClient.get('/api/safelist/stats');
    return response.data;
  },

  // Populate safelist from detector's built-in safelist
  populateFromDetector: async (): Promise<{
    added: number;
    skipped: number;
    tier1: number;
    tier2: number;
    tier3: number;
  }> => {
    const response = await apiClient.post('/api/safelist/populate-from-detector');
    return response.data;
  },
};
