"use client";

import DashboardLayout from "@/components/layouts/Dashboard";
import { Typography, Box, Grid, Paper } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";

export default function DashboardPage() {
  const { colors, mode } = useAppTheme();

  const stats = [
    { label: "Active Contests", value: "12", color: colors.PRIMARY },
    {
      label: "Total Participants",
      value: "1.2k",
      color: colors.SECONDARY,
    },
    { label: "Upcoming Events", value: "5", color: colors.ACCENT },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Typography
          variant="h4"
          sx={{
            color: colors.TEXT_PRIMARY,
            fontWeight: 700,
            mb: 1,
            letterSpacing: "-0.5px",
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: colors.TEXT_SECONDARY, mb: 4 }}
        >
          Welcome to your CMS Launchpad. Here's what's happening today.
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat) => (
            <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: colors.SURFACE,
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${colors.BORDER}`,
                  borderRadius: 3,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
                    borderColor: colors.PRIMARY,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: colors.TEXT_SECONDARY, mb: 1, fontWeight: 500 }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: stat.color, fontWeight: 800 }}
                >
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
