import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert,
} from '@mui/material';
import { MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
  domain?: string;
  loading?: boolean;
}

export interface FeedbackData {
  domain: string;
  issueType: 'false_positive' | 'false_negative' | 'feature_request' | 'bug_report' | 'other';
  description: string;
  contactEmail?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
  onSubmit,
  domain = '',
  loading = false,
}) => {
  const [formData, setFormData] = useState<FeedbackData>({
    domain,
    issueType: 'false_positive',
    description: '',
    contactEmail: '',
  });

  const [errors, setErrors] = useState<{ description?: string }>({});

  const handleSubmit = () => {
    // Validate
    const newErrors: { description?: string } = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setFormData({
      domain: '',
      issueType: 'false_positive',
      description: '',
      contactEmail: '',
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MessageSquare size={24} />
        Submit Feedback
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          Help us improve! Report false positives, bugs, or suggest new features.
        </Alert>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Domain (Optional)"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="example.com"
            variant="outlined"
          />
        </Box>

        <Box mb={2}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Issue Type</FormLabel>
            <RadioGroup
              value={formData.issueType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  issueType: e.target.value as FeedbackData['issueType'],
                })
              }
            >
              <FormControlLabel
                value="false_positive"
                control={<Radio />}
                label="False Positive (Benign marked as Malicious)"
              />
              <FormControlLabel
                value="false_negative"
                control={<Radio />}
                label="False Negative (Malicious marked as Benign)"
              />
              <FormControlLabel value="bug_report" control={<Radio />} label="Bug Report" />
              <FormControlLabel
                value="feature_request"
                control={<Radio />}
                label="Feature Request"
              />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            required
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={4}
            placeholder="Please provide detailed information..."
            variant="outlined"
            error={!!errors.description}
            helperText={errors.description}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Contact Email (Optional)"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            type="email"
            placeholder="your.email@example.com"
            variant="outlined"
            helperText="We'll contact you if we need more information"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
