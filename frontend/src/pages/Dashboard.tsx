import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Paper } from '@mui/material';
import { Activity, Shield, AlertTriangle, Zap, TrendingUp, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatCard from '@/components/cards/StatCard';
import LineChartTrends from '@/components/charts/LineChartTrends';
import DonutChartDistribution from '@/components/charts/DonutChartDistribution';
import { analyticsApi } from '@/api/analyticsApi';
import { DashboardStats, TrendData } from '@/api/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, trendsData] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getTrends(7),
        ]);
        setStats(dashboardData);
        setTrends(trendsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Typography>Loading dashboard...</Typography>
      </DashboardLayout>
    );
  }

  const distributionData = stats
    ? [
        { label: 'Benign', value: Math.round(stats.total_scans * (1 - stats.threat_rate / 100) * 0.85), color: '#00E676' },
        { label: 'Suspicious', value: Math.round(stats.total_scans * 0.1), color: '#FFB300' },
        { label: 'Malicious', value: Math.round((stats.threat_rate / 100) * stats.total_scans), color: '#FF1744' },
      ]
    : [];

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time DNS threat detection analytics and insights
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Scans"
            value={stats?.total_scans.toLocaleString() || '0'}
            icon={<Activity size={24} color="#00FFFF" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unique Domains"
            value={stats?.unique_domains.toLocaleString() || '0'}
            icon={<Users size={24} color="#00E676" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Threat Rate"
            value={`${stats?.threat_rate.toFixed(1) || '0'}%`}
            icon={<AlertTriangle size={24} color="#FF1744" />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Latency"
            value={`${stats?.avg_processing_time.toFixed(2) || '0'}ms`}
            icon={<Zap size={24} color="#FFB300" />}
            color="#FFB300"
          />
        </Grid>
      </Grid>

      {/* Activity Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Today"
            value={stats?.today_scans.toLocaleString() || '0'}
            icon={<TrendingUp size={20} color="#00FFFF" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="This Week"
            value={stats?.week_scans.toLocaleString() || '0'}
            icon={<TrendingUp size={20} color="#00FFFF" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="This Month"
            value={stats?.month_scans.toLocaleString() || '0'}
            icon={<TrendingUp size={20} color="#00FFFF" />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <LineChartTrends
            data={trends}
            lines={[
              { key: 'total_scans', name: 'Total Scans', color: '#00FFFF' },
              { key: 'malicious_count', name: 'Malicious', color: '#FF1744' },
              { key: 'benign_count', name: 'Benign', color: '#00E676' },
            ]}
            title="Scan Trends (Last 7 Days)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DonutChartDistribution
            data={distributionData}
            title="Scan Distribution"
            centerLabel="Total Scans"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0, 255, 255, 0.2)',
                },
              }}
              onClick={() => navigate('/scan')}
            >
              <Search size={32} color="#00FFFF" />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Single Scan
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0, 255, 255, 0.2)',
                },
              }}
              onClick={() => navigate('/safelist')}
            >
              <Shield size={32} color="#00E676" />
              <Typography variant="body2" sx={{ mt: 1 }}>
                View Safelist
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
