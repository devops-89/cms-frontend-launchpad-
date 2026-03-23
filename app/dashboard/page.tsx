"use client";

import DashboardLayout from "@/components/layouts/Dashboard";
import { Typography, Box, Grid } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import StatCard from "@/components/dashboard/StatCard";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import {
  EmojiEvents as ContestIcon,
  People as PeopleIcon,
  Event as EventIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { roboto } from "@/utils/fonts";

export default function DashboardPage() {
  const { colors } = useAppTheme();

  const stats = [
    {
      label: "Active Contests",
      value: "12",
      color: colors.PRIMARY,
      icon: <ContestIcon />,
      trend: "+12%",
      trendType: "up" as const,
    },
    {
      label: "Total Participants",
      value: "1,284",
      color: colors.SECONDARY,
      icon: <PeopleIcon />,
      trend: "+5.4%",
      trendType: "up" as const,
    },
    {
      label: "Upcoming Events",
      value: "5",
      color: colors.ACCENT,
      icon: <EventIcon />,
      trend: "-2%",
      trendType: "down" as const,
    },
    {
      label: "Avg. Engagement",
      value: "84%",
      color: "#8b5cf6",
      icon: <TrendingIcon />,
      trend: "+8%",
      trendType: "up" as const,
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h4"
            sx={{
              color: colors.TEXT_PRIMARY,
              fontWeight: 600,
              mb: 1,
              letterSpacing: "-1px",
              fontFamily: roboto.style.fontFamily,
            }}
          >
            Dashboard Overview
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}
          >
            Welcome back, Admin! Here's a snapshot of your platform's
            performance.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5 }}>
          <AnalyticsCharts />
        </Box>
      </Box>
    </DashboardLayout>
  );
}
