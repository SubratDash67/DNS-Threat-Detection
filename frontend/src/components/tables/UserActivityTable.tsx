import React from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { format } from 'date-fns';

interface UserActivityTableProps {
  data: any[];
  loading?: boolean;
}

const UserActivityTable: React.FC<UserActivityTableProps> = ({ data, loading }) => {
  const getActionColor = (action: string) => {
    if (action.includes('login')) return { bg: 'rgba(0, 230, 118, 0.2)', color: '#00E676' };
    if (action.includes('scan')) return { bg: 'rgba(0, 255, 255, 0.2)', color: '#00FFFF' };
    if (action.includes('delete')) return { bg: 'rgba(255, 23, 68, 0.2)', color: '#FF1744' };
    return { bg: 'rgba(255, 179, 0, 0.2)', color: '#FFB300' };
  };

  const columns: GridColDef[] = [
    {
      field: 'created_at',
      headerName: 'Timestamp',
      width: 180,
      valueFormatter: (params) => format(new Date(params.value), 'MMM dd, yyyy HH:mm:ss'),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: (params) => {
        const { bg, color } = getActionColor(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{ backgroundColor: bg, color, fontWeight: 500 }}
          />
        );
      },
    },
    {
      field: 'details',
      headerName: 'Details',
      flex: 1,
      minWidth: 300,
      valueFormatter: (params) => {
        if (typeof params.value === 'object') {
          return JSON.stringify(params.value);
        }
        return params.value || 'N/A';
      },
    },
    {
      field: 'ip_address',
      headerName: 'IP Address',
      width: 150,
    },
    {
      field: 'user_agent',
      headerName: 'User Agent',
      flex: 1,
      minWidth: 200,
    },
  ];

  const rows: GridRowsProp = data.map((item, index) => ({
    id: item.id || index,
    created_at: item.created_at,
    action: item.action,
    details: item.details,
    ip_address: item.ip_address || 'N/A',
    user_agent: item.user_agent || 'N/A',
  }));

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 20, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
          sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
        }}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default UserActivityTable;
