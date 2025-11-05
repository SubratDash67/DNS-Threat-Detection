import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  Alert,
  LinearProgress,
  Typography,
} from '@mui/material';
import { Check, X } from 'lucide-react';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  error?: string;
  loading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error, loading }) => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  React.useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 30) return 'error';
    if (passwordStrength < 60) return 'warning';
    return 'success';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Medium';
    return 'Strong';
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('full_name')}
        margin="normal"
        fullWidth
        label="Full Name (Optional)"
        autoComplete="name"
        autoFocus
        error={!!errors.full_name}
        helperText={errors.full_name?.message}
      />

      <TextField
        {...register('email')}
        margin="normal"
        required
        fullWidth
        label="Email Address"
        autoComplete="email"
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        {...register('password')}
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        autoComplete="new-password"
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      {password && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Password Strength:
            </Typography>
            <Typography variant="caption" color={`${getStrengthColor()}.main`}>
              {getStrengthLabel()}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={passwordStrength}
            color={getStrengthColor()}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Box sx={{ mt: 1 }}>
            {[
              { test: password.length >= 8, label: 'At least 8 characters' },
              { test: /[A-Z]/.test(password) && /[a-z]/.test(password), label: 'Upper & lowercase' },
              { test: /\d/.test(password), label: 'Contains number' },
              { test: /[^a-zA-Z0-9]/.test(password), label: 'Special character' },
            ].map((requirement, idx) => (
              <Box key={idx} display="flex" alignItems="center" gap={0.5}>
                {requirement.test ? (
                  <Check size={14} color="#00E676" />
                ) : (
                  <X size={14} color="#FF1744" />
                )}
                <Typography
                  variant="caption"
                  color={requirement.test ? 'success.main' : 'text.secondary'}
                >
                  {requirement.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <TextField
        {...register('confirmPassword')}
        margin="normal"
        required
        fullWidth
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2,
          background: 'linear-gradient(45deg, #00FFFF 30%, #00CCCC 90%)',
          color: '#0D1B2A',
          fontWeight: 600,
          '&:hover': {
            background: 'linear-gradient(45deg, #00CCCC 30%, #00FFFF 90%)',
          },
        }}
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </Box>
  );
};

export default RegisterForm;
