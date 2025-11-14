import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
} from '@mui/material';
import { Download, Trash2, Search } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import HistoryTable from '@/components/tables/HistoryTable';
import ScanDetailModal from '@/components/modals/ScanDetailModal';
import { historyApi } from '@/api/historyApi';
import { ScanResult, HistoryFilter } from '@/api/types';
import { useNotification } from '@/context/NotificationContext';

const History: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState<HistoryFilter>({
    page: 1,
    page_size: 50,
  });
  const { showSuccess, showError } = useNotification();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await historyApi.getHistory(filters);
      setScans(data);
    } catch (error) {
      showError('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await historyApi.exportHistory(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan-history-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess(`Exported history as ${format.toUpperCase()}`);
    } catch (error) {
      showError('Export failed');
    }
  };

  const handleDelete = async (scanId: number) => {
    try {
      await historyApi.deleteScan(scanId);
      showSuccess('Scan deleted successfully');
      fetchHistory();
    } catch (error) {
      showError('Failed to delete scan');
    }
  };

  const handleViewDetails = (scan: ScanResult) => {
    setSelectedScan(scan);
    setDetailModalOpen(true);
  };

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Scan History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and filter all your past domain scans
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              startIcon={<Download size={18} />}
              variant="outlined"
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              startIcon={<Download size={18} />}
              variant="outlined"
              onClick={() => handleExport('json')}
            >
              Export JSON
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Domain"
                placeholder="example.com"
                value={filters.domain || ''}
                onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                InputProps={{
                  startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Result Type"
                value={filters.result || ''}
                onChange={(e) => setFilters({ ...filters, result: e.target.value as any })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="BENIGN">Benign</MenuItem>
                <MenuItem value="SUSPICIOUS">Suspicious</MenuItem>
                <MenuItem value="MALICIOUS">Malicious</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Min Confidence"
                placeholder="0"
                value={filters.min_confidence || ''}
                onChange={(e) =>
                  setFilters({ ...filters, min_confidence: parseFloat(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1} alignItems="center" height="100%">
                <Button variant="contained" onClick={fetchHistory} fullWidth>
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setFilters({ page: 1, page_size: 50 })}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper>
          <HistoryTable
            scans={scans}
            loading={loading}
            onDelete={handleDelete}
            onRefresh={fetchHistory}
            onRowClick={handleViewDetails}
          />
        </Paper>

        <ScanDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          scan={selectedScan}
        />
      </Box>
    </DashboardLayout>
  );
};

export default History;
