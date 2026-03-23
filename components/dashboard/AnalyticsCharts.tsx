import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { LineChart, BarChart } from "@mui/x-charts";
import { useAppTheme } from "@/context/ThemeContext";

const AnalyticsCharts = () => {
  const { colors } = useAppTheme();

  const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
  const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
  const xLabels = [
    'Page A',
    'Page B',
    'Page C',
    'Page D',
    'Page E',
    'Page F',
    'Page G',
  ];

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: `1px solid ${colors.BORDER}`,
            bgcolor: colors.SURFACE
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            User Activity Trend
          </Typography>
          <Box sx={{ width: '100%', height: 350 }}>
            <LineChart
              series={[
                { data: pData, label: 'Sessions', color: colors.PRIMARY, area: true },
                { data: uData, label: 'New Users', color: colors.SECONDARY },
              ]}
              xAxis={[{ scaleType: 'point', data: xLabels }]}
              sx={{
                '& .MuiAreaElement-root': {
                  fillOpacity: 0.1,
                },
              }}
            />
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: `1px solid ${colors.BORDER}`,
            bgcolor: colors.SURFACE
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Contest Engagement
          </Typography>
          <Box sx={{ width: '100%', height: 350 }}>
            <BarChart
              series={[
                { data: [35, 44, 24, 34], label: 'Participants', color: colors.ACCENT },
              ]}
              xAxis={[{ scaleType: 'band', data: ['Contest 1', 'Contest 2', 'Contest 3', 'Contest 4'] }]}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AnalyticsCharts;
