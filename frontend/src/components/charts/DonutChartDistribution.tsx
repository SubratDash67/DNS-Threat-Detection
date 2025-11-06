import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

interface DonutData {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartDistributionProps {
  data: DonutData[];
  title?: string;
  centerLabel?: string;
  loading?: boolean;
}

const COLORS = ['#00E676', '#FF1744', '#FFB300', '#00FFFF', '#9C27B0'];

const DonutChartDistribution: React.FC<DonutChartDistributionProps> = ({
  data,
  title,
  centerLabel,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="card">
        <CardContent>
          <Skeleton variant="circular" width={250} height={250} />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="card" sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 2 }}>
        {title && (
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height: 320, position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || COLORS[index % COLORS.length]}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(27, 40, 56, 0.98)',
                  border: '1px solid #00FFFF',
                  borderRadius: 8,
                  color: '#fff',
                  padding: '8px 12px',
                }}
                formatter={(value: number) => [`${value.toLocaleString()} scans`, '']}
                labelFormatter={(label) => label}
              />
            </PieChart>
          </ResponsiveContainer>
          {centerLabel && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="primary" sx={{ fontSize: '2rem' }}>
                {total.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.5, display: 'block' }}>
                {centerLabel}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Legend */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {data.map((entry, index) => (
            <Box key={index} display="flex" alignItems="center" gap={0.75}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: entry.color || COLORS[index % COLORS.length], 
                  borderRadius: 0.5,
                  boxShadow: `0 0 4px ${entry.color || COLORS[index % COLORS.length]}80`
                }} 
              />
              <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                {entry.label} ({((entry.value / total) * 100).toFixed(1)}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DonutChartDistribution;
