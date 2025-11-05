import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search } from 'lucide-react';

const domainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .max(255, 'Domain is too long')
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      'Invalid domain format'
    ),
  use_safelist: z.boolean().optional(),
});

type DomainFormData = z.infer<typeof domainSchema>;

interface DomainScanFormProps {
  onSubmit: (data: DomainFormData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

const DomainScanForm: React.FC<DomainScanFormProps> = ({ onSubmit, loading, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      use_safelist: true,
    },
  });

  const handleFormSubmit = async (data: DomainFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('domain')}
        fullWidth
        label="Domain Name"
        placeholder="example.com"
        error={!!errors.domain}
        helperText={errors.domain?.message}
        disabled={loading}
        InputProps={{
          startAdornment: <Search size={20} style={{ marginRight: 8, color: '#00FFFF' }} />,
        }}
      />

      <FormControlLabel
        control={<Checkbox {...register('use_safelist')} defaultChecked disabled={loading} />}
        label="Check against safelist"
        sx={{ mt: 2 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3 }}
        startIcon={loading ? <CircularProgress size={20} /> : <Search size={20} />}
      >
        {loading ? 'Scanning...' : 'Scan Domain'}
      </Button>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 255, 255, 0.05)', borderRadius: 1 }}>
        <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          💡 Try: google.com (benign) or gooogle.com (typosquatting)
        </Box>
      </Box>
    </Box>
  );
};

export default DomainScanForm;
