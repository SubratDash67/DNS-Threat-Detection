import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Plus, Upload, Download, Trash2 } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import SafelistTable from '@/components/tables/SafelistTable';
import StatCard from '@/components/cards/StatCard';
import MetricCardGrid from '@/components/cards/MetricCardGrid';
import { safelistApi } from '@/api/safelistApi';
import { SafelistDomain, SafelistStats } from '@/api/types';
import { useNotification } from '@/context/NotificationContext';

const Safelist: React.FC = () => {
  const [currentTier, setCurrentTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');
  const [domains, setDomains] = useState<SafelistDomain[]>([]);
  const [stats, setStats] = useState<SafelistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState<{ domain: string; tier: 'tier1' | 'tier2' | 'tier3'; notes: string }>({ 
    domain: '', 
    tier: 'tier3', 
    notes: '' 
  });
  const { showSuccess, showError } = useNotification();

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const data = await safelistApi.getDomains(currentTier);
      console.log('Safelist domains:', data);
      setDomains(data);
    } catch (error) {
      console.error('Failed to load safelist:', error);
      showError('Failed to load safelist');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await safelistApi.getStats();
      console.log('Safelist stats:', data);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchDomains();
    fetchStats();
  }, [currentTier]);

  const handleAdd = async () => {
    try {
      await safelistApi.addDomain(newDomain);
      showSuccess('Domain added to safelist');
      setAddModalOpen(false);
      setNewDomain({ domain: '', tier: 'tier3', notes: '' });
      fetchDomains();
      fetchStats();
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to add domain');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await safelistApi.deleteDomain(id);
      showSuccess('Domain removed from safelist');
      fetchDomains();
      fetchStats();
    } catch (error) {
      showError('Failed to delete domain');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await safelistApi.exportSafelist(currentTier);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safelist-${currentTier}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Safelist exported');
    } catch (error) {
      showError('Export failed');
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Safelist Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage three-tier domain safelist for instant benign classification
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button startIcon={<Plus size={18} />} variant="contained" onClick={() => setAddModalOpen(true)}>
              Add Domain
            </Button>
            <Button startIcon={<Download size={18} />} variant="outlined" onClick={handleExport}>
              Export
            </Button>
          </Box>
        </Box>

        {stats && (
          <MetricCardGrid columns={{ xs: 1, sm: 2, md: 4, lg: 4 }}>
            <StatCard title="Total Domains" value={stats.total_domains} color="primary" />
            <StatCard title="Tier 1 (System)" value={stats.tier1_count} color="success" />
            <StatCard title="Tier 2 (Corporate)" value={stats.tier2_count} color="#FFB300" />
            <StatCard title="Tier 3 (User)" value={stats.tier3_count} color="#00FFFF" />
          </MetricCardGrid>
        )}

        <Paper sx={{ mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTier} onChange={(_, value) => setCurrentTier(value)}>
              <Tab label="Tier 1 - System" value="tier1" />
              <Tab label="Tier 2 - Corporate" value="tier2" />
              <Tab label="Tier 3 - User" value="tier3" />
            </Tabs>
          </Box>
          <Box sx={{ p: 2 }}>
            <SafelistTable
              data={domains}
              loading={loading}
              onDelete={handleDelete}
            />
          </Box>
        </Paper>

        <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Domain to Safelist</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Domain"
                placeholder="example.com"
                value={newDomain.domain}
                onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
              />
              <TextField
                fullWidth
                select
                label="Tier"
                value={newDomain.tier}
                onChange={(e) => setNewDomain({ ...newDomain, tier: e.target.value as 'tier1' | 'tier2' | 'tier3' })}
              >
                <MenuItem value="tier1">Tier 1 - System</MenuItem>
                <MenuItem value="tier2">Tier 2 - Corporate</MenuItem>
                <MenuItem value="tier3">Tier 3 - User</MenuItem>
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (optional)"
                value={newDomain.notes}
                onChange={(e) => setNewDomain({ ...newDomain, notes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} variant="contained">
              Add Domain
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Safelist;
