import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import { Upload, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import BatchUploadForm from '@/components/forms/BatchUploadForm';
import ScanResultsTable from '@/components/tables/ScanResultsTable';
import { scanApi } from '@/api/scanApi';
import { BatchJob, ScanResult } from '@/api/types';

const BatchScan: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<BatchJob | null>(null);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [polling, setPolling] = useState(false);

  const handleSubmit = async (domains: string[], useSafelist: boolean) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const job = await scanApi.scanBatch({
        domains,
        use_safelist: useSafelist,
      });
      setCurrentJob(job);
      setPolling(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start batch scan');
    } finally {
      setLoading(false);
    }
  };

  // Poll for job status
  useEffect(() => {
    if (!polling || !currentJob) return;

    const interval = setInterval(async () => {
      try {
        const status = await scanApi.getBatchStatus(currentJob.id);
        setCurrentJob(status);

        if (status.status === 'completed' || status.status === 'failed') {
          setPolling(false);
          if (status.status === 'completed') {
            const jobResults = await scanApi.getBatchResults(currentJob.id);
            setResults(jobResults);
          }
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
        setPolling(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [polling, currentJob]);

  const handleNewBatch = () => {
    setCurrentJob(null);
    setResults([]);
    setError(null);
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Batch Domain Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Upload or paste multiple domains for simultaneous threat analysis
        </Typography>

        {!currentJob ? (
          // Upload Form
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card className="card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Upload size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                    Upload Domains
                  </Typography>
                  <BatchUploadForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={error || undefined}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card className="card" sx={{ backgroundColor: 'rgba(0, 255, 255, 0.05)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Instructions
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      <li>Upload a TXT or CSV file</li>
                      <li>Or paste domains directly</li>
                      <li>One domain per line</li>
                      <li>Max 10,000 domains per batch</li>
                      <li>Processing takes ~0.5ms per domain</li>
                    </ul>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          // Job Progress & Results
          <Box>
            {/* Progress Card */}
            <Card className="card" sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">Batch Job #{currentJob.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: <Chip
                        label={currentJob.status.toUpperCase()}
                        size="small"
                        color={
                          currentJob.status === 'completed'
                            ? 'success'
                            : currentJob.status === 'failed'
                            ? 'error'
                            : 'primary'
                        }
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={handleNewBatch}
                    disabled={currentJob.status === 'processing'}
                  >
                    New Batch
                  </Button>
                </Box>

                {currentJob.status === 'processing' && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={currentJob.progress_percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {currentJob.processed_domains} / {currentJob.total_domains} domains processed (
                      {currentJob.progress_percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Box textAlign="center">
                      <Typography variant="h4">{currentJob.total_domains}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Box textAlign="center">
                      <Typography variant="h4">{currentJob.processed_domains}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Clock size={14} style={{ verticalAlign: 'middle' }} /> Processed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2.4}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main">
                        {currentJob.malicious_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <XCircle size={14} style={{ verticalAlign: 'middle' }} /> Malicious
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2.4}>
                    <Box textAlign="center">
                      <Typography variant="h4" sx={{ color: '#FFB300' }}>
                        {currentJob.suspicious_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ⚠️ Suspicious
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2.4}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {currentJob.benign_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <CheckCircle size={14} style={{ verticalAlign: 'middle' }} /> Benign
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {currentJob.status === 'completed' && (
                  <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircle size={20} />}>
                    Batch scan completed! Found {currentJob.malicious_count} malicious, {currentJob.suspicious_count} suspicious, and {currentJob.benign_count} benign domains out of {currentJob.total_domains} scanned.
                  </Alert>
                )}

                {currentJob.status === 'failed' && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Batch scan failed. Please try again.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Results Table */}
            {results.length > 0 && (
              <Card className="card">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Scan Results</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Download size={18} />}
                      size="small"
                    >
                      Export CSV
                    </Button>
                  </Box>
                  <ScanResultsTable data={results} />
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default BatchScan;
