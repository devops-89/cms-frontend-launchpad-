"use client";

import DashboardLayout from "@/components/layouts/Dashboard";
import { Typography, Box, Grid, CircularProgress } from "@mui/material";
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
import { useQuery } from "@tanstack/react-query";
import { contestControllers } from "@/api/contestControllers";
import { useGetAllUsers } from "@/hooks/user/useGetAllUsers";
import { UserRole, UserStatus } from "@/utils/enum";
import moment from "moment";

export default function DashboardPage() {
  const { colors } = useAppTheme();

  // Fetch contests
  const { data: contestsData, isPending: isContestsPending } = useQuery({
    queryKey: ["contests"],
    queryFn: () => contestControllers.getContest(),
  });
  const contestsList = contestsData?.data || [];

  // Fetch participants
  const { users: participants, isLoading: isParticipantsPending } =
    useGetAllUsers(UserRole.PARTICIPANT);

  const activeContestsCount = contestsList.filter(
    (c: any) => c.status === UserStatus.PUBLISHED
  ).length;

  const totalParticipantsCount = participants?.length || 0;

  const upcomingEventsCount = contestsList.filter(
    (c: any) => moment(c.start_date).isAfter(moment())
  ).length;

  const totalEntries = contestsList.reduce(
    (acc: number, c: any) => acc + (c.entries || c.total_entries || 0),
    0
  );
  
  const avgEngagement =
    totalParticipantsCount > 0
      ? Math.min(Math.round((totalEntries / totalParticipantsCount) * 100), 100)
      : 0;

  const stats = [
    {
      label: "Active Contests",
      value: activeContestsCount.toString(),
      color: colors.PRIMARY,
      icon: <ContestIcon />,
      trend: "+12%",
      trendType: "up" as const,
    },
    {
      label: "Total Participants",
      value: totalParticipantsCount.toString(),
      color: colors.SECONDARY,
      icon: <PeopleIcon />,
      trend: "+5.4%",
      trendType: "up" as const,
    },
    {
      label: "Upcoming Events",
      value: upcomingEventsCount.toString(),
      color: colors.ACCENT,
      icon: <EventIcon />,
      trend: "-2%",
      trendType: "down" as const,
    },
    {
      label: "Avg. Engagement",
      value: `${avgEngagement}%`,
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

        {isContestsPending || isParticipantsPending ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {stats.map((stat) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
                  <StatCard {...stat} />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 5 }}>
              <AnalyticsCharts contests={contestsList} participants={participants} />
            </Box>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
