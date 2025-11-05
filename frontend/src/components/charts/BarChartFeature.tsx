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
import { Card, CardContent, Typography, Box } from '@mui/material';

interface FeatureData {
  name: string;
  value: number;
  description?: string;
}

interface BarChartFeatureProps {
  data: FeatureData[];
  title?: string;
  valueLabel?: string;
}

const BarChartFeature: React.FC<BarChartFeatureProps> = ({ 
  data, 
  title,
  valueLabel = 'Importance (%)' 
}) => {
  const getColor = (value: number) => {
    if (value > 12) return '#FF1744';      // High importance
    if (value > 10) return '#FFB300';      // Medium-high importance
    if (value > 8) return '#00FFFF';       // Medium importance
    return '#00E676';                      // Lower importance
  };

  return (
    <Card className="card">
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <Box sx={{ width: '100%', height: 450 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                type="number" 
                stroke="#B0BEC5" 
                label={{ value: valueLabel, position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#B0BEC5"
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(27, 40, 56, 0.95)',
                  border: '1px solid #00FFFF',
                  borderRadius: 8,
                  color: '#fff',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Importance']}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChartFeature;
