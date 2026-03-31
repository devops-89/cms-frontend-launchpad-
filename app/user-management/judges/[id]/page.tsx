"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";

const JudgeDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Breadcrumb
          title={`Judge Details: #${id}`}
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Judges", href: "/user-management/judges" },
            { title: "Details", href: `/user-management/judges/${id}` },
          ]}
        />
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ color: colors.PRIMARY }}
        >
          Back to List
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.BORDER}` }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Judge Profile
        </Typography>
        <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY }}>
          Detailed information for Judge ID: <strong>{id}</strong> will be displayed here.
        </Typography>
        {/* Further details can be added here */}
      </Paper>
    </Box>
  );
};

export default JudgeDetailsPage;
