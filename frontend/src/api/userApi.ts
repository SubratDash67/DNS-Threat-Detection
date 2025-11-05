import apiClient from './client';
import { User } from './types';

export const userApi = {
  // Get user profile
  getProfile: async (userId?: number): Promise<User> => {
    const endpoint = userId ? `/api/users/${userId}` : '/api/auth/me';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/api/auth/me', data);
    return response.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<{
    total_scans: number;
    total_malicious: number;
    total_benign: number;
    avg_confidence: number;
    safelist_contributions: number;
    join_date: string;
    last_scan: string;
  }> => {
    const response = await apiClient.get('/api/users/statistics');
    return response.data;
  },

  // Upload user avatar
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/api/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get user activity log
  getActivityLog: async (page: number = 1, pageSize: number = 20): Promise<any[]> => {
    const response = await apiClient.get('/api/users/activity', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },
};
