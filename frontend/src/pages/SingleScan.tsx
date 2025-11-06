import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Shield, AlertTriangle, Clock, Activity } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DomainScanForm from '@/components/forms/DomainScanForm';
import ProgressCard from '@/components/cards/ProgressCard';
import { scanApi } from '@/api/scanApi';
import { ScanResult } from '@/api/types';
import { getResultColor } from '@/utils/getResultColor';
import { formatMethod } from '@/utils/formatMethod';

const SingleScan: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleScan = async (data: { domain: string; use_safelist?: boolean }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const scanResult = await scanApi.scanSingle({
        domain: data.domain,
        use_safelist: data.use_safelist ?? true,
      });
      setResult(scanResult);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to scan domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Single Domain Scan
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Analyze individual domains for potential threats in real-time
        </Typography>

        <Grid container spacing={3}>
          {/* Left: Scan Form */}
          <Grid item xs={12} md={5}>
            <Card className="card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Enter Domain
                </Typography>
                <DomainScanForm onSubmit={handleScan} loading={loading} error={error || undefined} />
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Results */}
          <Grid item xs={12} md={7}>
            {result ? (
              <Box>
                {/* Result Summary Card */}
                <Card
                  sx={{
                    borderLeft: `4px solid ${getResultColor(result.prediction)}`,
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(27, 40, 56, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
                    boxShadow: `0 4px 16px ${getResultColor(result.prediction)}30`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={3}>
                      <Box flex={1}>
                        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>
                          {result.domain}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                          {result.prediction === 'MALICIOUS' ? (
                            <AlertTriangle size={28} color="#FF1744" />
                          ) : (
                            <Shield size={28} color="#00E676" />
                          )}
                          <Typography
                            variant="h4"
                            sx={{
                              color: getResultColor(result.prediction),
                              fontWeight: 700,
                              textShadow: `0 0 10px ${getResultColor(result.prediction)}50`,
                            }}
                          >
                            {result.prediction}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ minWidth: 140 }}>
                        <ProgressCard
                          title="Confidence"
                          value={result.confidence * 100}
                          color={
                            result.prediction === 'MALICIOUS'
                              ? 'error'
                              : result.prediction === 'BENIGN'
                              ? 'success'
                              : 'warning'
                          }
                          size={100}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    <Grid container spacing={2.5}>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          backgroundColor: 'rgba(0, 255, 255, 0.05)',
                          border: '1px solid rgba(0, 255, 255, 0.2)',
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            Detection Method
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, color: '#00FFFF' }}>
                            {formatMethod(result.method)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          backgroundColor: 'rgba(255, 179, 0, 0.05)',
                          border: '1px solid rgba(255, 179, 0, 0.2)',
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            Processing Time
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, color: '#FFB300' }}>
                            <Clock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                            {result.latency_ms.toFixed(2)}ms
                          </Typography>
                        </Box>
                      </Grid>
                      {result.typosquatting_target && (
                        <Grid item xs={12}>
                          <Alert severity="warning" icon={<AlertTriangle size={20} />}>
                            <Typography variant="body2">
                              <strong>Typosquatting Detected!</strong>
                              <br />
                              This domain is similar to: <strong>{result.typosquatting_target}</strong>
                              {result.edit_distance && ` (Edit distance: ${result.edit_distance})`}
                            </Typography>
                          </Alert>
                        </Grid>
                      )}
                      {result.safelist_tier && (
                        <Grid item xs={12}>
                          <Alert severity="success">
                            <Typography variant="body2">
                              Found in safelist (Tier: {result.safelist_tier.toUpperCase()})
                            </Typography>
                          </Alert>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Detailed Analysis Tabs */}
                <Card className="card">
                  <CardContent>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                      <Tab label="Overview" />
                      <Tab label="Features" />
                      <Tab label="Detection Details" />
                    </Tabs>

                    <Box sx={{ mt: 3 }}>
                      {activeTab === 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Scan Overview
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {result.reason || 'Analysis completed successfully'}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Stage
                              </Typography>
                              <Typography variant="body1">{result.stage}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Scan ID
                              </Typography>
                              <Typography variant="body1">#{result.id}</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {activeTab === 1 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Feature Analysis
                          </Typography>
                          {result.features ? (
                            <Box
                              component="pre"
                              sx={{
                                p: 2,
                                bgcolor: 'rgba(0,0,0,0.2)',
                                borderRadius: 1,
                                overflow: 'auto',
                                fontSize: '0.875rem',
                              }}
                            >
                              {JSON.stringify(result.features, null, 2)}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Feature data not available for this scan method
                            </Typography>
                          )}
                        </Box>
                      )}

                      {activeTab === 2 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Detection Details
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">
                                Method
                              </Typography>
                              <Typography variant="body1">{result.method}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">
                                Reason
                              </Typography>
                              <Typography variant="body1">{result.reason}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">
                                Timestamp
                              </Typography>
                              <Typography variant="body1">
                                {new Date(result.created_at).toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Card className="card">
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Activity size={64} color="#00FFFF" style={{ marginBottom: 16 }} />
                  <Typography variant="h6" gutterBottom>
                    Ready to Scan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter a domain on the left to start analysis
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default SingleScan;
