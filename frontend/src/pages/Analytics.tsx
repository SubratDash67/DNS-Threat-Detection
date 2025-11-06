import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Tab, Tabs } from '@mui/material';
import DashboardLayout from '@/layouts/DashboardLayout';
import LineChartTrends from '@/components/charts/LineChartTrends';
import DonutChartDistribution from '@/components/charts/DonutChartDistribution';
import BarChartTLD from '@/components/charts/BarChartTLD';
import { analyticsApi } from '@/api/analyticsApi';
import { DashboardStats, TrendData, TLDAnalysis } from '@/api/types';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [tldData, setTldData] = useState<TLDAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [trendDays]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsData, trendsData, tldAnalysis] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getTrends(trendDays),
        analyticsApi.getTLDAnalysis(),
      ]);
      setStats(statsData);
      setTrends(trendsData);
      setTldData(tldAnalysis);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const distributionData = stats
    ? [
        { label: 'Benign', value: Math.round(stats.total_scans * (1 - stats.threat_rate / 100) * 0.85), color: '#00E676' },
        { label: 'Suspicious', value: Math.round(stats.total_scans * 0.1), color: '#FFB300' },
        { label: 'Malicious', value: Math.round(stats.total_scans * (stats.threat_rate / 100)), color: '#FF1744' },
      ]
    : [];

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Comprehensive threat intelligence and scanning metrics
        </Typography>

        {/* Time Range Selector */}
        <Card className="card" sx={{ mb: 3 }}>
          <CardContent>
            <Tabs value={trendDays} onChange={(_, v) => setTrendDays(v)}>
              <Tab label="7 Days" value={7} />
              <Tab label="14 Days" value={14} />
              <Tab label="30 Days" value={30} />
              <Tab label="90 Days" value={90} />
            </Tabs>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Scan Trends */}
          <Grid item xs={12} lg={8}>
            <LineChartTrends
              data={trends}
              lines={[
                { key: 'total_scans', name: 'Total Scans', color: '#00FFFF' },
                { key: 'malicious_count', name: 'Malicious', color: '#FF1744' },
                { key: 'suspicious_count', name: 'Suspicious', color: '#FFB300' },
                { key: 'benign_count', name: 'Benign', color: '#00E676' },
              ]}
              title="Scan Trends"
              loading={loading}
            />
          </Grid>

          {/* Distribution Donut */}
          <Grid item xs={12} lg={4}>
            <DonutChartDistribution
              data={distributionData}
              title="Threat Distribution"
              centerLabel="Total Scans"
              loading={loading}
            />
          </Grid>

          {/* TLD Risk Analysis */}
          <Grid item xs={12}>
            <BarChartTLD
              data={tldData}
              title="Top-Level Domain (TLD) Risk Analysis"
              loading={loading}
            />
          </Grid>

          {/* Summary Stats */}
          <Grid item xs={12}>
            <Card 
              className="card"
              sx={{
                background: 'linear-gradient(135deg, rgba(27, 40, 56, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                  Summary Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(0, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 255, 255, 0.2)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 255, 0.1)',
                        borderColor: '#00FFFF',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <Typography variant="h4" sx={{ color: '#00FFFF', fontWeight: 700 }}>
                        {stats?.total_scans.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        Total Scans
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(0, 230, 118, 0.05)',
                      border: '1px solid rgba(0, 230, 118, 0.2)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 230, 118, 0.1)',
                        borderColor: '#00E676',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <Typography variant="h4" sx={{ color: '#00E676', fontWeight: 700 }}>
                        {stats?.unique_domains.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        Unique Domains
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(255, 23, 68, 0.05)',
                      border: '1px solid rgba(255, 23, 68, 0.2)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 23, 68, 0.1)',
                        borderColor: '#FF1744',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <Typography variant="h4" sx={{ color: '#FF1744', fontWeight: 700 }}>
                        {stats?.threat_rate.toFixed(1) || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        Threat Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(255, 179, 0, 0.05)',
                      border: '1px solid rgba(255, 179, 0, 0.2)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 179, 0, 0.1)',
                        borderColor: '#FFB300',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <Typography variant="h4" sx={{ color: '#FFB300', fontWeight: 700 }}>
                        {stats?.avg_processing_time.toFixed(2) || 0}ms
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        Avg Response Time
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Analytics;
