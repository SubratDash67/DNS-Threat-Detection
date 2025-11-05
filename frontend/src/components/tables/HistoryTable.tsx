import React from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Box, Chip, LinearProgress } from '@mui/material';
import { format } from 'date-fns';
import Badge from '../common/Badge';
import { formatMethod } from '@/utils/formatMethod';

interface HistoryTableProps {
  data?: any[];
  scans?: any[];
  loading?: boolean;
  onRowClick?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
  page?: number;
  pageSize?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
  data,
  scans,
  loading,
  onRowClick,
  onDelete,
  onRefresh,
  page = 0,
  pageSize = 50,
  totalRows = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  // Support both 'data' and 'scans' props for backwards compatibility
  const tableData = scans || data || [];
  const columns: GridColDef[] = [
    {
      field: 'domain',
      headerName: 'Domain',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'prediction',
      headerName: 'Result',
      width: 130,
      renderCell: (params) => <Badge result={params.value} />,
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={params.value * 100}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              color={params.value > 0.8 ? 'success' : params.value > 0.5 ? 'warning' : 'error'}
            />
            <Box sx={{ minWidth: 45, fontSize: 12 }}>{(params.value * 100).toFixed(0)}%</Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'method',
      headerName: 'Method',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={formatMethod(params.value)}
          size="small"
          sx={{
            backgroundColor: params.value === 'safelist' ? 'rgba(0, 230, 118, 0.2)' : 
                           params.value === 'suspicious_detection' ? 'rgba(255, 179, 0, 0.2)' :
                           'rgba(0, 255, 255, 0.2)',
            color: params.value === 'safelist' ? '#00E676' : 
                   params.value === 'suspicious_detection' ? '#FFB300' :
                   '#00FFFF',
          }}
        />
      ),
    },
    {
      field: 'latency_ms',
      headerName: 'Latency',
      width: 100,
      valueFormatter: (params) => `${params.value?.toFixed(2)}ms`,
    },
    {
      field: 'created_at',
      headerName: 'Timestamp',
      width: 180,
      valueFormatter: (params) => format(new Date(params.value), 'MMM dd, yyyy HH:mm:ss'),
    },
  ];

  const rows: GridRowsProp = tableData.map((item) => ({
    id: item.id,
    domain: item.domain,
    prediction: item.prediction,
    confidence: item.confidence,
    method: item.method,
    latency_ms: item.latency_ms,
    created_at: item.created_at,
  }));

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(model) => {
          if (onPageChange && model.page !== page) onPageChange(model.page);
          if (onPageSizeChange && model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
        }}
        rowCount={totalRows || tableData.length}
        paginationMode={totalRows ? 'server' : 'client'}
        onRowClick={(params) => onRowClick?.(params.row.id)}
        sx={{
          '& .MuiDataGrid-row:hover': {
            cursor: onRowClick ? 'pointer' : 'default',
            backgroundColor: 'rgba(0, 255, 255, 0.05)',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
          },
        }}
      />
    </Box>
  );
};

export default HistoryTable;
