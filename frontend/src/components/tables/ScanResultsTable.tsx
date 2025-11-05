import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Eye, Download } from 'lucide-react';
import { ScanResult } from '@/api/types';
import { formatDate } from '@/utils/formatDate';
import { getResultColor } from '@/utils/getResultColor';
import Badge from '@/components/common/Badge';

interface ScanResultsTableProps {
  data: ScanResult[];
  onRowClick?: (scan: ScanResult) => void;
  loading?: boolean;
}

const ScanResultsTable: React.FC<ScanResultsTableProps> = ({ data, onRowClick, loading }) => {
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading results...</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No results to display</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Domain</TableCell>
            <TableCell>Result</TableCell>
            <TableCell align="right">Confidence</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Latency</TableCell>
            <TableCell>Scanned At</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((scan) => (
            <TableRow
              key={scan.id}
              hover
              onClick={() => onRowClick?.(scan)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor:
                  scan.prediction === 'MALICIOUS'
                    ? 'rgba(255, 23, 68, 0.05)'
                    : scan.prediction === 'SUSPICIOUS'
                    ? 'rgba(255, 179, 0, 0.05)'
                    : 'rgba(0, 230, 118, 0.03)',
                '&:hover': {
                  backgroundColor:
                    scan.prediction === 'MALICIOUS'
                      ? 'rgba(255, 23, 68, 0.1)'
                      : scan.prediction === 'SUSPICIOUS'
                      ? 'rgba(255, 179, 0, 0.1)'
                      : 'rgba(0, 230, 118, 0.08)',
                },
              }}
            >
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 500,
                  }}
                >
                  {scan.domain}
                </Typography>
                {scan.typosquatting_target && (
                  <Typography variant="caption" color="error">
                    Similar to: {scan.typosquatting_target}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Badge result={scan.prediction} />
              </TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: getResultColor(scan.prediction, 0.1),
                    color: getResultColor(scan.prediction),
                    fontWeight: 600,
                  }}
                >
                  {(scan.confidence * 100).toFixed(1)}%
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={scan.method}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {scan.latency_ms.toFixed(2)}ms
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(scan.created_at)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(scan);
                    }}
                  >
                    <Eye size={18} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScanResultsTable;
