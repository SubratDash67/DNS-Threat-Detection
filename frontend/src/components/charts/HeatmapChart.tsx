import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton, Tooltip as MuiTooltip } from '@mui/material';

interface HeatmapData {
  hour: number;
  day: string;
  count: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  title?: string;
  loading?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, title, loading }) => {
  if (loading) {
    return (
      <Card className="card">
        <CardContent>
          <Skeleton variant="rectangular" height={400} />
        </CardContent>
      </Card>
    );
  }

  // Create a map for quick lookup
  const dataMap = new Map(data.map((d) => [`${d.day}-${d.hour}`, d.count]));

  // Find max count for color scaling
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(27, 40, 56, 0.3)';
    const intensity = count / maxCount;
    if (intensity > 0.7) return `rgba(255, 23, 68, ${intensity})`;
    if (intensity > 0.4) return `rgba(255, 179, 0, ${intensity})`;
    return `rgba(0, 255, 255, ${intensity})`;
  };

  return (
    <Card className="card">
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ display: 'inline-grid', gridTemplateColumns: `40px repeat(24, 30px)`, gap: '2px', minWidth: '800px' }}>
            {/* Header row with hours */}
            <Box /> {/* Empty corner */}
            {HOURS.map((hour) => (
              <Box
                key={hour}
                sx={{
                  fontSize: 10,
                  textAlign: 'center',
                  color: 'text.secondary',
                  padding: '4px 0',
                }}
              >
                {hour}
              </Box>
            ))}

            {/* Data rows */}
            {DAYS.map((day) => (
              <React.Fragment key={day}>
                <Box
                  sx={{
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    paddingRight: 1,
                  }}
                >
                  {day.substring(0, 3)}
                </Box>
                {HOURS.map((hour) => {
                  const count = dataMap.get(`${day}-${hour}`) || 0;
                  return (
                    <MuiTooltip
                      key={`${day}-${hour}`}
                      title={`${day} ${hour}:00 - ${count} scans`}
                      arrow
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: getColor(count),
                          borderRadius: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            zIndex: 1,
                          },
                        }}
                      />
                    </MuiTooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(27, 40, 56, 0.3)', borderRadius: 1 }} />
            <Typography variant="caption">Low</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(0, 255, 255, 0.5)', borderRadius: 1 }} />
            <Typography variant="caption">Medium</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(255, 23, 68, 0.8)', borderRadius: 1 }} />
            <Typography variant="caption">High</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HeatmapChart;
