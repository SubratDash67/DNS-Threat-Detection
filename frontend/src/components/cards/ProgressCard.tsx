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
  return (
    <Card className="card">
      <CardContent>
        <Typography variant="h6" gutterBottom textAlign="center">
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
              thickness={4}
              color={color}
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
              <Typography variant="h4" fontWeight="bold">
                {Math.round(value)}%
              </Typography>
              {label && (
                <Typography variant="caption" color="text.secondary">
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
