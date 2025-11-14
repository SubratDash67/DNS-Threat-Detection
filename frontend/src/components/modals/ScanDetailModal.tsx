import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import { XCircle, CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';
import { ScanResult } from '@/api/types';
import RadarChartFeatures from '@/components/charts/RadarChartFeatures';
import { formatDate } from '@/utils/formatDate';
import { formatConfidence } from '@/utils/formatConfidence';
import { formatMethod } from '@/utils/formatMethod';
import Badge from '@/components/common/Badge';

interface ScanDetailModalProps {
  open: boolean;
  onClose: () => void;
  scan: ScanResult | null;
}

const ScanDetailModal: React.FC<ScanDetailModalProps> = ({ open, onClose, scan }) => {
  if (!scan) return null;

  const getResultIcon = () => {
    switch (scan.prediction) {
      case 'MALICIOUS':
        return <XCircle size={32} color="#FF1744" />;
      case 'SUSPICIOUS':
        return <AlertTriangle size={32} color="#FFB300" />;
      case 'BENIGN':
        return <CheckCircle size={32} color="#00E676" />;
      default:
        return <AlertTriangle size={32} color="#B0BEC5" />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {getResultIcon()}
          <Box flex={1}>
            <Typography variant="h5" fontWeight="bold">
              Scan Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {scan.domain}
            </Typography>
          </Box>
          <Badge result={scan.prediction} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Overview Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Confidence
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LinearProgress
                  variant="determinate"
                  value={scan.confidence * 100}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  color={scan.prediction === 'MALICIOUS' ? 'error' : 'success'}
                />
                <Typography variant="body2" fontWeight="bold">
                  {formatConfidence(scan.confidence)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Detection Method
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {formatMethod(scan.method)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Processing Time
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Clock size={16} />
                <Typography variant="body1" fontWeight="500">
                  {scan.latency_ms.toFixed(2)} ms
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Scan Date
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {formatDate(scan.created_at)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Typosquatting Detection */}
        {scan.typosquatting_target && (
          <>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom color="error">
                ⚠️ Typosquatting Detected
              </Typography>
              <Box
                sx={{
                  bgcolor: 'rgba(255, 23, 68, 0.1)',
                  border: '1px solid #FF1744',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography variant="body2" gutterBottom>
                  This domain appears to be impersonating:
                </Typography>
                <Typography variant="h6" color="error" gutterBottom>
                  {scan.typosquatting_target}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Edit Distance: {scan.edit_distance}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Safelist Information */}
        {scan.safelist_tier && (
          <>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                <Shield size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Safelist Information
              </Typography>
              <Chip
                label={`${scan.safelist_tier.toUpperCase()} - Trusted Domain`}
                color="success"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                This domain is in the system safelist and considered safe.
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Detection Reason */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Detection Analysis
          </Typography>
          <Box
            sx={{
              bgcolor: 'background.elevated',
              borderRadius: 2,
              p: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="body2">
              <strong>Stage:</strong> {scan.stage}
            </Typography>
            <Typography variant="body2" mt={1}>
              <strong>Reason:</strong> {scan.reason || 'Machine learning prediction'}
            </Typography>
          </Box>
        </Box>

        {/* Feature Analysis */}
        {scan.features && Object.keys(scan.features).length > 0 ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Feature Analysis
              </Typography>
              
              {/* Feature Grid Display */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {Object.entries(scan.features).map(([key, value]) => (
                  <Grid item xs={6} sm={4} md={3} key={key}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.elevated',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#00FFFF', mt: 0.5 }}>
                        {typeof value === 'number' ? value.toFixed(4) : value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              {/* Radar Chart - Only show if we have numeric features */}
              {Object.values(scan.features).some(v => typeof v === 'number') && (
                <RadarChartFeatures 
                  data={Object.entries(scan.features)
                    .filter(([_, value]) => typeof value === 'number')
                    .map(([key, value]) => ({
                      feature: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                      value: typeof value === 'number' ? value : 0,
                    }))
                  } 
                />
              )}
            </Box>
          </>
        ) : (
          scan.method === 'safelist' || scan.method === 'legitimate_domain_whitelist' ? null : (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Feature Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Features not available for this detection method ({scan.method})
                </Typography>
              </Box>
            </>
          )
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            // Add to safelist action
            console.log('Add to safelist:', scan.domain);
          }}
          disabled={scan.prediction === 'MALICIOUS'}
        >
          Add to Safelist
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScanDetailModal;
