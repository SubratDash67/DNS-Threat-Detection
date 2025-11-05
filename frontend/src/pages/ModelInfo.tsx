import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Brain, Layers, Zap, Target } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatCard from '@/components/cards/StatCard';
import MetricCardGrid from '@/components/cards/MetricCardGrid';
import BarChartFeature from '@/components/charts/BarChartFeature';
import { modelsApi } from '@/api/modelsApi';
import { ModelInfo as ModelInfoType, FeatureInfo } from '@/api/types';

const ModelInfo: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfoType | null>(null);
  const [features, setFeatures] = useState<FeatureInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, feats] = await Promise.all([
          modelsApi.getInfo(),
          modelsApi.getFeatures(),
        ]);
        console.log('Model Info:', info);
        console.log('Features:', feats);
        setModelInfo(info);
        setFeatures(feats);
      } catch (error) {
        console.error('Failed to load model info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Loading model information...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (!modelInfo) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography color="error">Failed to load model information. Please try again.</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Model Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          ML architecture, performance metrics, and feature importance
        </Typography>

        {modelInfo && (
          <>
            <MetricCardGrid columns={{ xs: 1, sm: 2, md: 4, lg: 4 }}>
              <StatCard
                title="F1-Score"
                value={`${(modelInfo.performance.f1_score * 100).toFixed(2)}%`}
                icon={<Target size={24} color="#00FFFF" />}
                color="primary"
              />
              <StatCard
                title="Accuracy"
                value={`${(modelInfo.performance.accuracy * 100).toFixed(2)}%`}
                icon={<Zap size={24} color="#00E676" />}
                color="success"
              />
              <StatCard
                title="Avg Latency"
                value={`${modelInfo.performance.avg_latency_ms.toFixed(2)}ms`}
                icon={<Layers size={24} color="#FFB300" />}
                color="#FFB300"
              />
              <StatCard
                title="Safelist Domains"
                value={modelInfo.safelist.total_domains.toLocaleString()}
                icon={<Brain size={24} color="#00FFFF" />}
                color="primary"
              />
            </MetricCardGrid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Model Architecture
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" flexDirection="column" gap={2}>
                      {modelInfo.architecture?.map((component, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 2,
                            bgcolor: 'rgba(0, 255, 255, 0.05)',
                            borderRadius: 1,
                            borderLeft: '3px solid #00FFFF',
                          }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            {component}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Precision"
                          secondary={`${(modelInfo.performance.precision * 100).toFixed(2)}%`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Recall"
                          secondary={`${(modelInfo.performance.recall * 100).toFixed(2)}%`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="F1-Score"
                          secondary={`${(modelInfo.performance.f1_score * 100).toFixed(2)}%`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Version" secondary={modelInfo.version} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ mt: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feature Importance (Top {features.length})
              </Typography>
              <Divider sx={{ my: 2 }} />
              {features.length > 0 && (
                <BarChartFeature
                  data={features.map((f) => ({
                    name: f.name,
                    value: f.importance * 100,
                    description: f.description,
                  }))}
                  title="Feature Importance Scores"
                  valueLabel="Importance (%)"
                />
              )}
            </Paper>

            <Paper sx={{ mt: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feature Descriptions
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {features.map((feature, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid rgba(0, 255, 255, 0.2)',
                        borderRadius: 1,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {feature.name}
                        </Typography>
                        <Chip
                          label={`${(feature.importance * 100).toFixed(1)}%`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default ModelInfo;
