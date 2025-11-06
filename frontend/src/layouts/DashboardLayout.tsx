import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '@/components/navigation/Sidebar';
import TopNavBar from '@/components/navigation/TopNavBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '260px',
          mt: '64px',
          backgroundColor: '#0D1B2A',
          minHeight: '100vh',
        }}
      >
        <TopNavBar />
        <Box 
          sx={{ 
            p: 4,
            maxWidth: '1400px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
