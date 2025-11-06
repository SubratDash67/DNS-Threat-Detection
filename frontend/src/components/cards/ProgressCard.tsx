import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

interface ProgressCardProps {
  title: string;
  value: number; // 0-100
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  size?: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  label,
  color = 'primary',
  size = 120,
}) => {
  const colorMap = {
    primary: '#00FFFF',
    secondary: '#9C27B0',
    success: '#00E676',
    error: '#FF1744',
    warning: '#FFB300',
  };
  
  const actualColor = colorMap[color] || colorMap.primary;
  
  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(27, 40, 56, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
        border: `1px solid ${actualColor}30`,
        boxShadow: `0 4px 12px ${actualColor}20`,
      }}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', fontWeight: 600 }}>
          {title}
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ py: 2 }}
        >
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={value}
              size={size}
              thickness={5}
              color={color}
              sx={{
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h4" fontWeight="bold" sx={{ color: actualColor }}>
                {Math.round(value)}%
              </Typography>
              {label && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                  {label}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
