import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { User, Settings, Activity, Lock } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';
import { userApi } from '@/api/userApi';
import StatCard from '@/components/cards/StatCard';
import MetricCardGrid from '@/components/cards/MetricCardGrid';
import { formatDate } from '@/utils/formatDate';
import ChangePasswordForm from '@/components/forms/ChangePasswordForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [stats, setStats] = useState<{
    total_scans: number;
    total_malicious: number;
    total_benign: number;
    avg_confidence: number;
    safelist_contributions: number;
    join_date: string;
    last_scan: string | null;
  } | null>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user statistics
      const userStats = await userApi.getUserStats();
      setStats(userStats);

      // Fetch activity log
      const activity = await userApi.getActivityLog(1, 10);
      setActivityLog(activity);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser(formData);
      setSuccess('Profile updated successfully');
      setEditMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to change password');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <LoadingSpinner />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Manage your account settings and preferences
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab icon={<User size={18} />} label="Overview" />
            <Tab icon={<Settings size={18} />} label="Settings" />
            <Tab icon={<Activity size={18} />} label="Activity" />
            <Tab icon={<Lock size={18} />} label="Security" />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                      bgcolor: 'primary.main',
                      fontSize: 48,
                    }}
                  >
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="h5" sx={{ mt: 2 }}>
                    {user?.full_name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label={user?.role === 'admin' ? 'Administrator' : 'User'}
                    color={user?.role === 'admin' ? 'secondary' : 'default'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Member since {formatDate(user?.created_at || '')}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Your Statistics
                </Typography>
                {stats ? (
                  <MetricCardGrid columns={{ xs: 1, sm: 2 }}>
                    <StatCard
                      title="Total Scans"
                      value={stats.total_scans}
                      color="primary"
                    />
                    <StatCard
                      title="Malicious Detected"
                      value={stats.total_malicious}
                      color="error"
                    />
                    <StatCard
                      title="Benign Domains"
                      value={stats.total_benign}
                      color="success"
                    />
                    <StatCard
                      title="Avg Confidence"
                      value={`${(stats.avg_confidence * 100).toFixed(1)}%`}
                      color="#FFB300"
                    />
                  </MetricCardGrid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No scanning activity yet
                  </Typography>
                )}
                
                {stats?.last_scan && (
                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Last scan: {formatDate(stats.last_scan)}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>

              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                disabled
                sx={{ mb: 3 }}
                helperText="Email cannot be changed"
              />

              {editMode ? (
                <Box display="flex" gap={2}>
                  <Button variant="contained" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                  <Button variant="outlined" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button variant="contained" onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              )}

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255, 23, 68, 0.1)',
                  border: '1px solid #FF1744',
                }}
              >
                <Typography variant="body2" gutterBottom>
                  Once you delete your account, there is no going back. Please be certain.
                </Typography>
                <Button variant="outlined" color="error" sx={{ mt: 1 }}>
                  Delete Account
                </Button>
              </Paper>
            </Box>
          </TabPanel>

          {/* Activity Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {activityLog.map((activity) => (
                <ListItem
                  key={activity.id}
                  sx={{
                    bgcolor: 'background.elevated',
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <ListItemText
                    primary={activity.action}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {activity.details}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(activity.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <ChangePasswordForm onSubmit={handlePasswordChange} />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default Profile;
