import apiClient from './client';
import { ScanRequest, ScanResult, BatchScanRequest, BatchJob } from './types';

export const scanApi = {
  // Scan single domain
  scanSingle: async (data: ScanRequest): Promise<ScanResult> => {
    const response = await apiClient.post('/api/scan/single', data);
    return response.data;
  },

  // Start batch scan
  scanBatch: async (data: BatchScanRequest): Promise<BatchJob> => {
    const response = await apiClient.post('/api/scan/batch', data);
    return response.data;
  },

  // Get batch job status
  getBatchStatus: async (jobId: number): Promise<BatchJob> => {
    const response = await apiClient.get(`/api/scan/batch/${jobId}`);
    return response.data;
  },

  // Get batch job results
  getBatchResults: async (
    jobId: number,
    page: number = 1,
    pageSize: number = 50
  ): Promise<ScanResult[]> => {
    const response = await apiClient.get(`/api/scan/batch/${jobId}/results`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },
};
