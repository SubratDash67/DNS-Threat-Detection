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
      <CardContent sx={{ pb: 2 }}>
        {title && (
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height: 380 }}>
          <ResponsiveContainer>
            <BarChart
              data={topData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                stroke="#B0BEC5" 
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <YAxis 
                type="category" 
                dataKey="tld" 
                stroke="#B0BEC5"
                tick={{ fontSize: 12 }}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(27, 40, 56, 0.98)',
                  border: '1px solid #00FFFF',
                  borderRadius: 8,
                  padding: '8px 12px',
                }}
                formatter={(value: any) => [`${value.toFixed(1)}%`, 'Risk Score']}
                labelFormatter={(label) => `TLD: .${label}`}
              />
              <Bar dataKey="risk_score" radius={[0, 4, 4, 0]} barSize={24}>
                {topData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.risk_score)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#FF1744', borderRadius: 0.5, boxShadow: '0 0 4px #FF174480' }} />
            <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>High Risk (&gt;75%)</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#FFB300', borderRadius: 0.5, boxShadow: '0 0 4px #FFB30080' }} />
            <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Medium (50-75%)</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#00FFFF', borderRadius: 0.5, boxShadow: '0 0 4px #00FFFF80' }} />
            <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Low (25-50%)</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#00E676', borderRadius: 0.5, boxShadow: '0 0 4px #00E67680' }} />
            <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Safe (&lt;25%)</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChartTLD;
