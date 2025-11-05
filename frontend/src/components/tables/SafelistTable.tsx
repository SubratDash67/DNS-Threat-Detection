import React, { useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip, IconButton, TextField } from '@mui/material';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface SafelistTableProps {
  data: any[];
  loading?: boolean;
  onEdit?: (id: number, notes: string) => void;
  onDelete?: (id: number) => void;
}

const SafelistTable: React.FC<SafelistTableProps> = ({ data, loading, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (id: number, currentNotes: string) => {
    setEditingId(id);
    setEditValue(currentNotes || '');
  };

  const handleSave = (id: number) => {
    onEdit?.(id, editValue);
    setEditingId(null);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier1':
        return { bg: 'rgba(255, 23, 68, 0.2)', color: '#FF1744' };
      case 'tier2':
        return { bg: 'rgba(255, 179, 0, 0.2)', color: '#FFB300' };
      case 'tier3':
        return { bg: 'rgba(0, 230, 118, 0.2)', color: '#00E676' };
      default:
        return { bg: 'rgba(0, 255, 255, 0.2)', color: '#00FFFF' };
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'domain',
      headerName: 'Domain',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'tier',
      headerName: 'Tier',
      width: 100,
      renderCell: (params) => {
        const { bg, color } = getTierColor(params.value);
        return (
          <Chip
            label={params.value.toUpperCase()}
            size="small"
            sx={{ backgroundColor: bg, color, fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'notes',
      headerName: 'Notes',
      flex: 1,
      minWidth: 200,
      editable: true,
      renderCell: (params: GridRenderCellParams) => {
        if (editingId === params.row.id) {
          return (
            <TextField
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleSave(params.row.id)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSave(params.row.id);
              }}
              size="small"
              fullWidth
              autoFocus
            />
          );
        }
        return params.value || <em style={{ color: '#666' }}>No notes</em>;
      },
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant={params.value === 'system' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Added',
      width: 150,
      valueFormatter: (params) => format(new Date(params.value), 'MMM dd, yyyy'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row.id, params.row.notes)}
            disabled={params.row.source === 'system'}
          >
            <Edit2 size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete?.(params.row.id)}
            disabled={params.row.source === 'system'}
            sx={{ color: 'error.main' }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const rows: GridRowsProp = data.map((item) => ({
    id: item.id,
    domain: item.domain,
    tier: item.tier,
    notes: item.notes,
    source: item.source,
    created_at: item.created_at,
  }));

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 50 } },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.05)',
          },
        }}
      />
    </Box>
  );
};

export default SafelistTable;
