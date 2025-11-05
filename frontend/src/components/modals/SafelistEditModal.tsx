import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { Shield } from 'lucide-react';
import { SafelistDomain } from '@/api/types';

interface SafelistEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { tier?: string; notes?: string }) => void;
  domain: SafelistDomain | null;
  loading?: boolean;
}

const SafelistEditModal: React.FC<SafelistEditModalProps> = ({
  open,
  onClose,
  onSave,
  domain,
  loading = false,
}) => {
  const [tier, setTier] = useState<string>('tier3');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (domain) {
      setTier(domain.tier);
      setNotes(domain.notes || '');
    }
  }, [domain]);

  const handleSave = () => {
    onSave({ tier, notes });
  };

  if (!domain) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Shield size={24} color="#00FFFF" />
        Edit Safelist Domain
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Domain"
            value={domain.domain}
            disabled
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Box>

        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel>Tier</InputLabel>
            <Select value={tier} onChange={(e) => setTier(e.target.value)} label="Tier">
              <MenuItem value="tier1">
                Tier 1 - High Trust (Fortune 500, Gov, Major Tech)
              </MenuItem>
              <MenuItem value="tier2">Tier 2 - Moderate Trust (Popular Services)</MenuItem>
              <MenuItem value="tier3">Tier 3 - User Added (Custom Whitelist)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            placeholder="Add optional notes about this domain..."
            variant="outlined"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SafelistEditModal;
