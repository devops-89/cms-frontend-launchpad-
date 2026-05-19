import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { LineChart, BarChart } from "@mui/x-charts";
import { useAppTheme } from "@/context/ThemeContext";
import moment from "moment";

interface AnalyticsChartsProps {
  contests?: any[];
  participants?: any[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ contests = [], participants = [] }) => {
  const { colors } = useAppTheme();

  // Generate labels for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => 
    moment().subtract(6 - i, 'days').format('MMM DD')
  );
  
  // Group users by joined date for the last 7 days
  const newUsersData = last7Days.map(dateStr => {
    return participants.filter(p => {
      const date = p.joinedAt || (p.participantProfile && p.participantProfile.createdAt) || p.createdAt;
      if (!date) return false;
      return moment(date).format('MMM DD') === dateStr;
    }).length;
  });
  
  // Mock sessions data based on new users for demonstration
  const sessionsData = newUsersData.map(v => 
    v === 0 ? Math.floor(Math.random() * 5) + 2 : v * (Math.floor(Math.random() * 3) + 2)
  );

  const xLabels = last7Days;

  // Process contest data for engagement
  const topContests = [...contests]
    .sort((a, b) => (b.entries || b.total_entries || 0) - (a.entries || a.total_entries || 0))
    .slice(0, 4);

  const contestLabels = topContests.length > 0 
    ? topContests.map((c) => c.name.length > 10 ? c.name.substring(0,10) + "..." : c.name) 
    : ["No Contests"];
    
  const contestData = topContests.length > 0 
    ? topContests.map((c) => c.entries || c.total_entries || 0) 
    : [0];

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: `1px solid ${colors.BORDER}`,
            bgcolor: colors.SURFACE,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            User Activity Trend
          </Typography>
          <Box sx={{ width: "100%", height: 350 }}>
            <LineChart
              series={[
                {
                  data: sessionsData,
                  label: "Sessions",
                  color: colors.PRIMARY,
                  area: true,
                },
                { data: newUsersData, label: "New Users", color: colors.SECONDARY },
              ]}
              xAxis={[{ scaleType: "point", data: xLabels }]}
              sx={{
                "& .MuiAreaElement-root": {
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
            bgcolor: colors.SURFACE,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Contest Engagement
          </Typography>
          <Box sx={{ width: "100%", height: 350 }}>
            <BarChart
              series={[
                {
                  data: contestData,
                  label: "Entries",
                  color: colors.ACCENT,
                },
              ]}
              xAxis={[
                {
                  scaleType: "band",
                  data: contestLabels,
                },
              ]}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AnalyticsCharts;
