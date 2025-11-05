import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, Typography, Skeleton } from '@mui/material';

interface FeatureMetric {
  feature: string;
  value: number;
  baseline?: number;
}

interface RadarChartFeaturesProps {
  data: FeatureMetric[];
  title?: string;
  loading?: boolean;
}

const RadarChartFeatures: React.FC<RadarChartFeaturesProps> = ({ data, title, loading }) => {
  if (loading) {
    return (
      <Card className="card">
        <CardContent>
          <Skeleton variant="rectangular" height={350} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom textAlign="center">
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data}>
            <PolarGrid stroke="#1B2838" />
            <PolarAngleAxis dataKey="feature" stroke="#B0BEC5" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis stroke="#B0BEC5" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1B2838',
                border: '1px solid #00FFFF',
                borderRadius: 8,
              }}
            />
            <Legend />
            <Radar
              name="Domain"
              dataKey="value"
              stroke="#00FFFF"
              fill="#00FFFF"
              fillOpacity={0.6}
            />
            {data[0]?.baseline !== undefined && (
              <Radar
                name="Baseline"
                dataKey="baseline"
                stroke="#00E676"
                fill="#00E676"
                fillOpacity={0.3}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RadarChartFeatures;
