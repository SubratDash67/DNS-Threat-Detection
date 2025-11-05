import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  InputBase,
} from '@mui/material';
import { Search, Bell, LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: 260,
        width: 'calc(100% - 260px)',
        backgroundColor: '#1B2838',
        borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
      }}
    >
      <Toolbar>
        {/* Search Bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            backgroundColor: 'rgba(13, 27, 42, 0.6)',
            '&:hover': {
              backgroundColor: 'rgba(13, 27, 42, 0.8)',
            },
            marginRight: 2,
            marginLeft: 0,
            width: '100%',
            maxWidth: 400,
            border: '1px solid rgba(0, 255, 255, 0.2)',
          }}
        >
          <Box
            sx={{
              padding: '0 16px',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={20} color="#B0BEC5" />
          </Box>
          <InputBase
            placeholder="Search domains..."
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: '8px 8px 8px 0',
                paddingLeft: '48px',
                transition: 'width 0.3s',
                width: '100%',
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Notifications */}
        <IconButton
          size="large"
          sx={{
            color: '#B0BEC5',
            '&:hover': { color: '#00FFFF' },
          }}
        >
          <Badge badgeContent={3} color="error">
            <Bell size={20} />
          </Badge>
        </IconButton>

        {/* User Menu */}
        <Box sx={{ ml: 2 }}>
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 255, 0.05)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#00FFFF',
                color: '#0D1B2A',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {user?.email.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={600}>
                {user?.full_name || user?.email.split('@')[0] || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'admin' ? 'Administrator' : 'User'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                backgroundColor: '#1B2838',
                border: '1px solid rgba(0, 255, 255, 0.2)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                {user?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.1)' }} />
            <MenuItem onClick={handleProfile} sx={{ gap: 1.5, py: 1.5 }}>
              <User size={18} />
              <Typography variant="body2">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ gap: 1.5, py: 1.5 }}>
              <Settings size={18} />
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.1)' }} />
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.5, color: '#FF1744' }}>
              <LogOut size={18} />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
