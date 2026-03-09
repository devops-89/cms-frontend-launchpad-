"use client";

import React from "react";
// import DashboardLayout from "@/components/layouts/Dashboard";
import DashboardLayout from "@/components/layouts/Dashboard";
import { Box } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import ContestList from "@/components/contest/ContestList";

import { useRouter } from "next/navigation";

export default function ViewContestPage() {
  const { colors } = useAppTheme();
  const router = useRouter();

  const handleViewContest = (contest: any) => {
    router.push(`/dashboard/contest/${contest.id}`);
  };

  return (
    <DashboardLayout>
      <Box sx={{ color: colors.TEXT_PRIMARY }}>
        <ContestList onViewContest={handleViewContest} />
      </Box>
    </DashboardLayout>
  );
}
