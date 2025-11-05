import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Error', 
  message, 
  severity = 'error' 
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity={severity} icon={<AlertCircle size={20} />}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
