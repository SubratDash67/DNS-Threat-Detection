import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  LayoutDashboard,
  Search,
  FolderSearch,
  BarChart3,
  History,
  Shield,
  Brain,
  User,
} from 'lucide-react';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { text: 'Single Scan', icon: <Search size={20} />, path: '/scan' },
  { text: 'Batch Analysis', icon: <FolderSearch size={20} />, path: '/batch' },
  { text: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
  { text: 'History', icon: <History size={20} />, path: '/history' },
  { text: 'Safelist', icon: <Shield size={20} />, path: '/safelist' },
  { text: 'Model Info', icon: <Brain size={20} />, path: '/models' },
  { text: 'Profile', icon: <User size={20} />, path: '/profile' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1B2838',
          borderRight: '1px solid rgba(0, 255, 255, 0.1)',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #00FFFF 0%, #00CCCC 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={24} color="#0D1B2A" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: '#00FFFF', fontWeight: 700, lineHeight: 1.2 }}>
            DNS Security
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Threat Detection
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,  // Increased vertical padding
                  px: 2,    // Increased horizontal padding
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 255, 255, 0.15)',
                    borderLeft: '3px solid #00FFFF',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 255, 0.2)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#00FFFF' : '#B0BEC5', minWidth: 44 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#00FFFF' : '#FFFFFF',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Version Info */}
      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
