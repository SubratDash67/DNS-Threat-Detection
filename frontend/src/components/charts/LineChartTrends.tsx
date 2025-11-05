import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

interface TrendPoint {
  date: string;
  [key: string]: string | number;
}

interface LineChartTrendsProps {
  data: TrendPoint[];
  lines: { key: string; name: string; color: string }[];
  title?: string;
  loading?: boolean;
}

const LineChartTrends: React.FC<LineChartTrendsProps> = ({ data, lines, title, loading }) => {
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
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B2838" />
              <XAxis dataKey="date" stroke="#B0BEC5" />
              <YAxis stroke="#B0BEC5" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B2838',
                  border: '1px solid #00FFFF',
                  borderRadius: 8,
                }}
              />
              <Legend />
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ fill: line.color }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LineChartTrends;
