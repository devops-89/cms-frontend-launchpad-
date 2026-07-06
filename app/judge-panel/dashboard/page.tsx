"use client";

import JudgePanelLayout from "@/components/layouts/JudgePanel";
import { Typography, Box, Grid, CircularProgress } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import { roboto } from "@/utils/fonts";
import StatCard from "@/components/dashboard/StatCard";
import { Assessment as AssessmentIcon, AssignmentTurnedIn as CompletedIcon, PendingActions as PendingIcon } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { judgeControllers } from "@/api/judgeControllers";

export default function JudgeDashboardPage() {
  const { colors } = useAppTheme();
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const result = await judgeControllers.getAssignedEntries(1, 50);
        const allEntries = result.data?.docs || [];
        const filtered = allEntries.filter((e: any) => {
          const displayStatus = e.entry?.status?.toLowerCase() || e.status?.toLowerCase();
          return ['approved', 'evaluated', 'semifinal', 'final', 'winner'].includes(displayStatus) || (e.score !== undefined && e.score !== null && e.score > 0) || (e.entry?.score !== undefined && e.entry?.score !== null && e.entry?.score > 0);
        });
        setEntries(filtered);
      } catch (err) {
        console.error("Failed to fetch entries", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const totalAssigned = entries.length;
  const evaluatedCount = entries.filter(e => e.status?.toLowerCase() === "evaluated" || e.entry?.status?.toLowerCase() === "evaluated" || (e.score !== undefined && e.score !== null && e.score > 0) || (e.entry?.score !== undefined && e.entry?.score !== null && e.entry?.score > 0)).length;
  const moderateCount = totalAssigned - evaluatedCount;

  const stats = [
    {
      label: "Assigned Entries",
      value: totalAssigned.toString(),
      color: colors.PRIMARY,
      icon: <AssessmentIcon />,
      trend: "Total",
      trendType: "up" as const,
    },
    {
      label: "Evaluated",
      value: evaluatedCount.toString(),
      color: colors.SECONDARY,
      icon: <CompletedIcon />,
      trend: `${evaluatedCount > 0 ? "+" + evaluatedCount : "0"}`,
      trendType: "up" as const,
    },
    {
      label: "Moderate",
      value: moderateCount.toString(),
      color: colors.ACCENT,
      icon: <PendingIcon />,
      trend: `${moderateCount > 0 ? moderateCount : "0"}`,
      trendType: moderateCount > 0 ? "down" as const : "up" as const,
    },
  ];

  return (
    <JudgePanelLayout>
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
            Judge Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}
          >
            Welcome! Here's an overview of your evaluation progress.
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {stats.map((stat) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.label}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </JudgePanelLayout>
  );
}
