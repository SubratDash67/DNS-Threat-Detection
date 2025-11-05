import React from 'react';
import { Chip } from '@mui/material';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BadgeProps {
  result: 'BENIGN' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN' | string;
  size?: 'small' | 'medium';
}

const Badge: React.FC<BadgeProps> = ({ result, size = 'small' }) => {
  const getConfig = () => {
    switch (result.toUpperCase()) {
      case 'BENIGN':
        return {
          color: '#00E676',
          bgColor: 'rgba(0, 230, 118, 0.1)',
          icon: <CheckCircle size={16} />,
          label: 'Benign',
        };
      case 'SUSPICIOUS':
        return {
          color: '#FFB300',
          bgColor: 'rgba(255, 179, 0, 0.1)',
          icon: <AlertCircle size={16} />,
          label: 'Suspicious',
        };
      case 'MALICIOUS':
        return {
          color: '#FF1744',
          bgColor: 'rgba(255, 23, 68, 0.1)',
          icon: <XCircle size={16} />,
          label: 'Malicious',
        };
      case 'UNKNOWN':
      default:
        return {
          color: '#B0BEC5',
          bgColor: 'rgba(176, 190, 197, 0.1)',
          icon: <AlertCircle size={16} />,
          label: 'Unknown',
        };
    }
  };

  const config = getConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size={size}
      sx={{
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}`,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: config.color,
        },
      }}
    />
  );
};

export default Badge;
