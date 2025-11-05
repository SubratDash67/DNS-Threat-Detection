import React from 'react';
import { Card, CardContent, Typography, Box, Alert } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface AlertCardProps {
  title: string;
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  action?: React.ReactNode;
}

const AlertCard: React.FC<AlertCardProps> = ({ title, message, severity = 'error', action }) => {
  return (
    <Card
      className="card"
      sx={{
        borderLeft: `4px solid ${
          severity === 'error'
            ? '#FF1744'
            : severity === 'warning'
            ? '#FFB300'
            : severity === 'success'
            ? '#00E676'
            : '#00FFFF'
        }`,
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <AlertTriangle
            size={24}
            color={
              severity === 'error'
                ? '#FF1744'
                : severity === 'warning'
                ? '#FFB300'
                : '#00FFFF'
            }
          />
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
