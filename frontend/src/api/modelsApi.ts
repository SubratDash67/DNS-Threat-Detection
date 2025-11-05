import apiClient from './client';
import { ModelInfo, FeatureInfo } from './types';

export const modelsApi = {
  // Get model information
  getInfo: async (): Promise<ModelInfo> => {
    const response = await apiClient.get('/api/models/info');
    return response.data;
  },

  // Get feature information
  getFeatures: async (): Promise<FeatureInfo[]> => {
    const response = await apiClient.get('/api/models/features');
    return response.data.features || [];
  },

  // Reload models (admin only)
  reload: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/models/reload');
    return response.data;
  },
};
