import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, Typography, Skeleton } from '@mui/material';

interface HistogramDataPoint {
  range: string;
  count: number;
}

interface HistogramConfidenceProps {
  data: HistogramDataPoint[];
  title?: string;
  loading?: boolean;
}

const HistogramConfidence: React.FC<HistogramConfidenceProps> = ({ data, title, loading }) => {
  if (loading) {
    return (
      <Card className="card">
        <CardContent>
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1B2838" />
            <XAxis dataKey="range" stroke="#B0BEC5" />
            <YAxis stroke="#B0BEC5" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1B2838',
                border: '1px solid #00FFFF',
                borderRadius: 8,
              }}
            />
            <Bar dataKey="count" fill="#00FFFF" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HistogramConfidence;
