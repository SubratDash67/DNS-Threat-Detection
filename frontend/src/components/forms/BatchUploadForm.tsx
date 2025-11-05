import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Upload, File, X } from 'lucide-react';

interface BatchUploadFormProps {
  onSubmit: (domains: string[], useSafelist: boolean) => Promise<void>;
  loading?: boolean;
  error?: string;
}

const BatchUploadForm: React.FC<BatchUploadFormProps> = ({ onSubmit, loading, error }) => {
  const [domains, setDomains] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [useSafelist, setUseSafelist] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text
          .split(/[\r\n,]+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        setDomains(lines);
        setTextInput(lines.join('\n'));
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextInput(text);
    const lines = text
      .split(/[\r\n,]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    setDomains(lines);
    setUploadedFile(null);
  };

  const handleSubmit = async () => {
    if (domains.length > 0) {
      await onSubmit(domains, useSafelist);
      setDomains([]);
      setTextInput('');
      setUploadedFile(null);
    }
  };

  const handleClear = () => {
    setDomains([]);
    setTextInput('');
    setUploadedFile(null);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Drag & Drop Zone */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.700',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'rgba(0, 255, 255, 0.05)' : 'transparent',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(0, 255, 255, 0.03)',
          },
        }}
      >
        <input {...getInputProps()} />
        <Upload size={48} style={{ color: '#00FFFF', marginBottom: 16 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop file here' : 'Drag & drop a file'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse (TXT, CSV)
        </Typography>
      </Box>

      {uploadedFile && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<File size={16} />}
            label={uploadedFile.name}
            onDelete={handleClear}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}

      {/* OR Divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'grey.700' }} />
        <Typography sx={{ mx: 2, color: 'text.secondary' }}>OR</Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'grey.700' }} />
      </Box>

      {/* Text Input */}
      <TextField
        fullWidth
        multiline
        rows={8}
        value={textInput}
        onChange={handleTextChange}
        placeholder="Paste domains here (one per line or comma-separated)&#10;example.com&#10;test.org&#10;sample.net"
        disabled={loading}
        helperText={`${domains.length} domains entered`}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={useSafelist}
            onChange={(e) => setUseSafelist(e.target.checked)}
            disabled={loading}
          />
        }
        label="Check against safelist"
        sx={{ mt: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={domains.length === 0 || loading}
          startIcon={<Upload size={20} />}
        >
          {loading ? `Scanning ${domains.length} domains...` : `Scan ${domains.length} Domains`}
        </Button>
        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={domains.length === 0 || loading}
        >
          Clear
        </Button>
      </Box>

      {domains.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Ready to scan {domains.length} domain{domains.length > 1 ? 's' : ''}. This may take a
          few moments.
        </Alert>
      )}
    </Box>
  );
};

export default BatchUploadForm;
