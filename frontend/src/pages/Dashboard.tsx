import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { Activity, Shield, AlertTriangle, Zap, TrendingUp, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatCard from '@/components/cards/StatCard';
import LineChartTrends from '@/components/charts/LineChartTrends';
import DonutChartDistribution from '@/components/charts/DonutChartDistribution';
import { analyticsApi, DetectionMethod } from '@/api/analyticsApi';
import { DashboardStats, TrendData } from '@/api/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [detectionMethods, setDetectionMethods] = useState<DetectionMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, trendsData, methodsData] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getTrends(7),
          analyticsApi.getDetectionMethods(),
        ]);
        setStats(dashboardData);
        setTrends(trendsData);
        setDetectionMethods(methodsData);
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
  
  const detectionMethodData = detectionMethods.map((method, index) => {
    const colors = ['#00FFFF', '#00E676', '#FFB300', '#FF1744', '#9C27B0', '#2196F3'];
    return {
      label: method.method.replace(/_/g, ' '),
      value: method.count,
      color: colors[index % colors.length],
    };
  });

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
        <Grid item xs={12} lg={8}>
          <LineChartTrends
            data={trends}
            lines={[
              { key: 'total_scans', name: 'Total Scans', color: '#00FFFF' },
              { key: 'malicious_count', name: 'Malicious', color: '#FF1744' },
              { key: 'suspicious_count', name: 'Suspicious', color: '#FFB300' },
              { key: 'benign_count', name: 'Benign', color: '#00E676' },
            ]}
            title="Scan Trends (Last 7 Days)"
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <DonutChartDistribution
            data={distributionData}
            title="Threat Distribution"
            centerLabel={`${stats?.total_scans || 0} Total`}
          />
        </Grid>
      </Grid>

      {/* Detection Method Breakdown */}
      {detectionMethodData.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <DonutChartDistribution
              data={detectionMethodData}
              title="Detection Methods"
              centerLabel="Methods"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card 
              className="card" 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(27, 40, 56, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Detection Method Statistics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {detectionMethodData.map((method, index) => (
                    <Box
                      key={method.label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        pb: 2,
                        borderBottom: index < detectionMethodData.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 255, 255, 0.05)',
                          borderRadius: 1,
                          px: 1,
                          mx: -1,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: method.color,
                            boxShadow: `0 0 6px ${method.color}80`,
                          }}
                        />
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {method.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: method.color }}>
                        {method.value.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: 'linear-gradient(135deg, rgba(27, 40, 56, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 255, 255, 0.3)',
                  borderColor: '#00FFFF',
                },
              }}
              onClick={() => navigate('/scan')}
            >
              <Box sx={{ mb: 1.5 }}>
                <Search size={36} color="#00FFFF" />
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Single Scan
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Analyze individual domain
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: 'linear-gradient(135deg, rgba(27, 40, 56, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
                border: '1px solid rgba(0, 230, 118, 0.2)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 230, 118, 0.3)',
                  borderColor: '#00E676',
                },
              }}
              onClick={() => navigate('/safelist')}
            >
              <Box sx={{ mb: 1.5 }}>
                <Shield size={36} color="#00E676" />
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Safelist
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage trusted domains
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
