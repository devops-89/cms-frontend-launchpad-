"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { UserController } from "@/api/userControllers";
import JudgeAssignmentsTable from "@/components/layouts/Judges/components/JudgeAssignmentsTable";

const JudgeDetailsPage = () => {
  const params = useParams();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string;
  const router = useRouter();
  const { colors } = useAppTheme();

  const { data, isPending } = useQuery({
    queryKey: ["judge-details", id],
    queryFn: () => UserController.getUserById(id),
    enabled: !!id,
  });

  const judgeData = data?.data?.data || data?.data;
  const entryAssignments = judgeData?.entryAssignments || [];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Breadcrumb
          title={`Judge Details: ${judgeData ? judgeData.firstName + " " + judgeData.lastName : "#" + id}`}
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

      {isPending ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.BORDER}`, boxShadow: "none" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
              {judgeData?.firstName} {judgeData?.lastName}
            </Typography>
            <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY }}>
              {judgeData?.email} | {judgeData?.phone}
            </Typography>
            {judgeData?.judgeProfile?.expertise && (
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                {judgeData.judgeProfile.expertise.map((exp: string, idx: number) => (
                  <Chip key={idx} label={exp} size="small" />
                ))}
              </Box>
            )}
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Entry Assignments
          </Typography>

          <JudgeAssignmentsTable 
            entryAssignments={entryAssignments} 
            judge={{ id: judgeData?.id, name: `${judgeData?.firstName} ${judgeData?.lastName}` }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default JudgeDetailsPage;
