import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={2} sx={{ mt: 3 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => onPageChange(1)}
        disabled={disabled || page === 1}
        startIcon={<ChevronsLeft size={16} />}
      >
        First
      </Button>

      <Button
        variant="outlined"
        size="small"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page === 1}
        startIcon={<ChevronLeft size={16} />}
      >
        Prev
      </Button>

      <Typography variant="body2" sx={{ px: 2 }}>
        Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
      </Typography>

      <Button
        variant="outlined"
        size="small"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        endIcon={<ChevronRight size={16} />}
      >
        Next
      </Button>

      <Button
        variant="outlined"
        size="small"
        onClick={() => onPageChange(totalPages)}
        disabled={disabled || page >= totalPages}
        endIcon={<ChevronsRight size={16} />}
      >
        Last
      </Button>
    </Box>
  );
};

export default PaginationControls;
