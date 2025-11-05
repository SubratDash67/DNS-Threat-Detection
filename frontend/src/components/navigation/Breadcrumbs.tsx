import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import { ChevronRight } from 'lucide-react';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  scan: 'Single Scan',
  batch: 'Batch Analysis',
  analytics: 'Analytics',
  history: 'History',
  safelist: 'Safelist',
  models: 'Model Information',
  profile: 'Profile',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <MuiBreadcrumbs
        separator={<ChevronRight size={16} color="#B0BEC5" />}
        aria-label="breadcrumb"
      >
        <Link
          to="/dashboard"
          style={{
            color: '#B0BEC5',
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          Home
        </Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = routeNames[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return isLast ? (
            <Typography key={to} color="#00FFFF" fontSize={14} fontWeight={600}>
              {label}
            </Typography>
          ) : (
            <Link
              key={to}
              to={to}
              style={{
                color: '#B0BEC5',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              {label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
