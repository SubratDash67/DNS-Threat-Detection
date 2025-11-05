import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Link } from '@mui/material';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/forms/LoginForm';
import AuthLayout from '@/layouts/AuthLayout';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isLoading, clearError } = useAuthStore();

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            borderRadius: '50%',
            p: 2,
            mb: 2,
          }}
        >
          <Shield size={48} color="#00FFFF" />
        </Box>
        <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
          DNS Threat Detection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your account
        </Typography>
      </Box>

      <LoginForm onSubmit={handleLogin} error={error || undefined} loading={isLoading} />

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            sx={{
              color: '#00FFFF',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: 'rgba(0, 255, 255, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(0, 255, 255, 0.2)',
        }}
      >
        <Typography variant="caption" display="block" fontWeight="bold" color="#00FFFF">
          Demo Credentials
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          Email: demo@example.com
        </Typography>
        <Typography variant="caption" display="block">
          Password: demo123456
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default Login;
