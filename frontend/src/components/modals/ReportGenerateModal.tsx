import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Typography,
  Checkbox,
  FormGroup,
} from '@mui/material';
import { FileText, Download } from 'lucide-react';

interface ReportGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (options: ReportOptions) => void;
  loading?: boolean;
}

export interface ReportOptions {
  format: 'pdf' | 'csv';
  dateRange: 'today' | 'week' | 'month' | 'all';
  includeCharts: boolean;
  includeDetails: boolean;
  filterMalicious: boolean;
}

const ReportGenerateModal: React.FC<ReportGenerateModalProps> = ({
  open,
  onClose,
  onGenerate,
  loading = false,
}) => {
  const [options, setOptions] = useState<ReportOptions>({
    format: 'pdf',
    dateRange: 'week',
    includeCharts: true,
    includeDetails: false,
    filterMalicious: false,
  });

  const handleGenerate = () => {
    onGenerate(options);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FileText size={24} />
        Generate Report
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Report Format</FormLabel>
            <RadioGroup
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value as 'pdf' | 'csv' })}
            >
              <FormControlLabel value="pdf" control={<Radio />} label="PDF (with charts)" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV (data only)" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box mb={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Date Range</FormLabel>
            <RadioGroup
              value={options.dateRange}
              onChange={(e) =>
                setOptions({
                  ...options,
                  dateRange: e.target.value as 'today' | 'week' | 'month' | 'all',
                })
              }
            >
              <FormControlLabel value="today" control={<Radio />} label="Today" />
              <FormControlLabel value="week" control={<Radio />} label="Last 7 Days" />
              <FormControlLabel value="month" control={<Radio />} label="Last 30 Days" />
              <FormControlLabel value="all" control={<Radio />} label="All Time" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box mb={2}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Include</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeCharts}
                    onChange={(e) => setOptions({ ...options, includeCharts: e.target.checked })}
                    disabled={options.format === 'csv'}
                  />
                }
                label="Charts and Visualizations"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeDetails}
                    onChange={(e) => setOptions({ ...options, includeDetails: e.target.checked })}
                  />
                }
                label="Detailed Scan Information"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.filterMalicious}
                    onChange={(e) => setOptions({ ...options, filterMalicious: e.target.checked })}
                  />
                }
                label="Malicious Domains Only"
              />
            </FormGroup>
          </FormControl>
        </Box>

        <Box
          sx={{
            bgcolor: 'rgba(0, 255, 255, 0.1)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography variant="caption" display="block">
            <strong>Note:</strong> Report generation may take a few moments depending on the amount of data.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          startIcon={<Download size={18} />}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportGenerateModal;
