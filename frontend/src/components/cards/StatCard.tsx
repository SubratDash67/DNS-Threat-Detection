import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon?: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, color = 'primary' }) => {
  return (
    <Card 
      className="card hover:scale-105 transition-transform duration-200"
      sx={{ 
        background: 'linear-gradient(135deg, rgba(27, 40, 56, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
        borderLeft: `4px solid ${color === 'primary' ? '#00FFFF' : color === 'error' ? '#FF1744' : color === 'success' ? '#00E676' : '#FFB300'}`,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>
              {value}
            </Typography>
            {trend !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {trend > 0 ? (
                  <TrendingUp size={16} color="#00E676" />
                ) : trend < 0 ? (
                  <TrendingDown size={16} color="#FF1744" />
                ) : null}
                <Typography
                  variant="caption"
                  color={trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary'}
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
