import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Link } from '@mui/material';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import RegisterForm from '@/components/forms/RegisterForm';
import AuthLayout from '@/layouts/AuthLayout';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuthStore();

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRegister = async (data: {
    email: string;
    password: string;
    full_name?: string;
  }) => {
    try {
      await register(data.email, data.password, data.full_name);
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
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join DNS Threat Detection Platform
        </Typography>
      </Box>

      <RegisterForm onSubmit={handleRegister} error={error || undefined} loading={isLoading} />

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: '#00FFFF',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default Register;
