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

interface LineChartTrendsProps {
  data: any[]; // More flexible to accept TrendData from API
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
      <CardContent sx={{ pb: 2 }}>
        {title && (
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                {lines.map((line) => (
                  <linearGradient key={`gradient-${line.key}`} id={`color-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#B0BEC5" 
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis 
                stroke="#B0BEC5" 
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(27, 40, 56, 0.98)',
                  border: '1px solid #00FFFF',
                  borderRadius: 8,
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#00FFFF', fontWeight: 600, marginBottom: 4 }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="line"
                iconSize={18}
              />
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={{ fill: line.color, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
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
