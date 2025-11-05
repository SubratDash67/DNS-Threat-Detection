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
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom textAlign="center">
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height: 350, position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                fill="#8884d8"
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                labelLine={{ stroke: '#00FFFF', strokeWidth: 1 }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(27, 40, 56, 0.95)',
                  border: '1px solid #00FFFF',
                  borderRadius: 8,
                  color: '#fff',
                }}
                formatter={(value: number) => value.toLocaleString()}
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
              <Typography variant="h4" fontWeight="bold" color="primary">
                {total.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {centerLabel}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DonutChartDistribution;
