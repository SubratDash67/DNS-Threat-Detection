import React from 'react';
import { Grid } from '@mui/material';

interface MetricCardGridProps {
  children: React.ReactNode;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
}) => {
  return (
    <Grid container spacing={3}>
      {React.Children.map(children, (child) => (
        <Grid item xs={columns.xs || 12} sm={columns.sm || 6} md={columns.md || 4} lg={columns.lg || 3}>
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricCardGrid;
