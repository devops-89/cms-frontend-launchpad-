"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/Dashboard";
import { Box, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";
import ContestTabs from "@/components/contest/ContestTabs";
import ContestStats from "@/components/contest/ContestStats";
import EntriesSection from "@/components/contest/EntriesSection";
import { CONTESTS } from "@/utils/constant";

export default function ContestDetailsPage() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [activeTab, setActiveTab] = React.useState(0);

  const contest = CONTESTS.find((c) => c.id.toString() === id);

  if (!contest) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" mb={2}>
            Contest Not Found
          </Typography>
          <Button onClick={() => router.push("/dashboard/view-contest")}>
            Back to List
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <DashboardLayout>
      <Box sx={{ color: colors.TEXT_PRIMARY }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/dashboard/view-contest")}
          sx={{
            color: colors.TEXT_SECONDARY,
            mb: 2,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              color: colors.PRIMARY,
              bgcolor: `${colors.PRIMARY}10`,
            },
          }}
        >
          Back to List
        </Button>

        <Box mb={4}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: colors.TEXT_PRIMARY,
              letterSpacing: "-0.5px",
            }}
          >
            {contest.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.TEXT_SECONDARY, mt: 0.5 }}
          >
            Contest ID: #{contest.id} • Status: {contest.status} •{" "}
            {contest.participants} participants
          </Typography>
        </Box>

        <ContestTabs value={activeTab} onChange={handleTabChange} />
        <ContestStats />

        {activeTab === 1 && <EntriesSection />}
      </Box>
    </DashboardLayout>
  );
}
