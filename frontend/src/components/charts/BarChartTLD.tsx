import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { TLDAnalysis } from '@/api/types';

interface BarChartTLDProps {
  data: TLDAnalysis[];
  title?: string;
  loading?: boolean;
}

const BarChartTLD: React.FC<BarChartTLDProps> = ({ data, title, loading }) => {
  if (loading) {
    return (
      <Card className="card">
        <CardContent>
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    );
  }

  const topData = data.slice(0, 10); // Show top 10 TLDs

  const getColor = (riskScore: number) => {
    if (riskScore > 75) return '#FF1744';
    if (riskScore > 50) return '#FFB300';
    if (riskScore > 25) return '#00FFFF';
    return '#00E676';
  };

  return (
    <Card className="card">
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={topData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1B2838" />
              <XAxis type="number" stroke="#B0BEC5" label={{ value: 'Risk Score (%)', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="tld" stroke="#B0BEC5" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B2838',
                  border: '1px solid #00FFFF',
                  borderRadius: 8,
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === 'risk_score') {
                    return [`${value.toFixed(1)}%`, 'Risk Score'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `TLD: ${label}`}
              />
              <Bar dataKey="risk_score" radius={[0, 4, 4, 0]}>
                {topData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.risk_score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#FF1744', borderRadius: 0.5 }} />
            <Typography variant="caption">High Risk (&gt;75%)</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#FFB300', borderRadius: 0.5 }} />
            <Typography variant="caption">Medium Risk (50-75%)</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#00FFFF', borderRadius: 0.5 }} />
            <Typography variant="caption">Low Risk (25-50%)</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#00E676', borderRadius: 0.5 }} />
            <Typography variant="caption">Safe (&lt;25%)</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChartTLD;
