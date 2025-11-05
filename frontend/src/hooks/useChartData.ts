import { useState, useEffect } from 'react';
import apiClient from '@/api/client';

interface UseChartDataOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

export function useChartData<T>(
  endpoint: string,
  params?: Record<string, any>,
  options: UseChartDataOptions = {}
) {
  const { refreshInterval, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        const response = await apiClient.get<T>(endpoint, { params });
        setData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [endpoint, params, refreshInterval, enabled]);

  return { data, loading, error };
}
