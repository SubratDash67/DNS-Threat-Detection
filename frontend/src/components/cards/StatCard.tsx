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
  const borderColor = color === 'primary' ? '#00FFFF' : color === 'error' ? '#FF1744' : color === 'success' ? '#00E676' : '#FFB300';
  
  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(27, 40, 56, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
        borderLeft: `4px solid ${borderColor}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${borderColor}40`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, ${borderColor}15, transparent)`,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1.5, mb: 1, color: '#fff' }}>
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
                  sx={{ 
                    fontWeight: 600,
                    color: trend > 0 ? '#00E676' : trend < 0 ? '#FF1744' : 'text.secondary'
                  }}
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                backgroundColor: `${borderColor}20`,
                borderRadius: 2,
                p: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${borderColor}30`,
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
