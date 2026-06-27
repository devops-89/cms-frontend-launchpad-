"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Avatar,
  Grid,
  Divider,
  Skeleton,
  Stack,
  Card,
} from "@mui/material";
import {
  ArrowBack,
  EmailOutlined,
  LocalPhoneOutlined,
  EditOutlined,
  AssignmentTurnedInOutlined,
  StarOutline,
} from "@mui/icons-material";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { UserController } from "@/api/userControllers";
import JudgeAssignmentsTable from "@/components/layouts/Judges/components/JudgeAssignmentsTable";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Active":
    case "Published":
      return { bgcolor: "#dcfce7", color: "#166534" };
    case "Pending":
    case "Draft":
      return { bgcolor: "#ffedd5", color: "#c2410c" };
    case "Banned":
    case "Rejected":
      return { bgcolor: "#fee2e2", color: "#991b1b" };
    default:
      return { bgcolor: "#f3f4f6", color: "#374151" };
  }
};

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
  const statusStyle = getStatusStyles(judgeData?.status || "Pending");
  const fullName = judgeData ? `${judgeData.firstName} ${judgeData.lastName}` : "";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Breadcrumb
          title="Judge Profile"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Judges", href: "/user-management/judges" },
            { title: "Details", href: `/user-management/judges/${id}` },
          ]}
        />
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            variant="outlined"
            sx={{ color: colors.TEXT_SECONDARY, borderColor: colors.BORDER, textTransform: "none", fontWeight: 600 }}
          >
            Back
          </Button>
          {!isPending && (
            <Button
              startIcon={<EditOutlined />}
              onClick={() => router.push(`/user-management/judges/${id}/edit`)}
              variant="contained"
              sx={{ bgcolor: colors.PRIMARY, textTransform: "none", fontWeight: 600, boxShadow: "none" }}
            >
              Edit Profile
            </Button>
          )}
        </Stack>
      </Box>

      {isPending ? (
        <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.BORDER}`, boxShadow: "none" }}>
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <Skeleton variant="circular" width={80} height={80} />
            <Box>
              <Skeleton variant="text" width={250} height={40} />
              <Skeleton variant="text" width={100} height={30} />
            </Box>
          </Stack>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
        </Paper>
      ) : (
        <Stack spacing={4}>
          <Card
            sx={{
              p: 4,
              borderRadius: 3,
              border: `1px solid ${colors.BORDER}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <Grid container spacing={4}>
              {/* Profile Header & Contact */}
              <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: `${colors.PRIMARY}15`,
                      color: colors.PRIMARY,
                      fontSize: "2.5rem",
                      fontWeight: 700,
                      mb: 2,
                      border: `2px solid ${colors.PRIMARY}30`,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY, mb: 1 }}>
                    {fullName}
                  </Typography>
                  <Box
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      py: 0.5,
                      px: 2,
                      borderRadius: "20px",
                      bgcolor: statusStyle.bgcolor,
                      color: statusStyle.color,
                      mb: 3,
                    }}
                  >
                    {judgeData?.status || "Pending"}
                  </Box>

                  <Box sx={{ width: "100%", mt: 2 }}>
                    <Stack spacing={2} sx={{ width: "fit-content", mx: "auto", textAlign: "left" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: colors.TEXT_SECONDARY }}>
                        <EmailOutlined fontSize="small" sx={{ color: colors.PRIMARY }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {judgeData?.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: colors.TEXT_SECONDARY }}>
                        <LocalPhoneOutlined fontSize="small" sx={{ color: colors.PRIMARY }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {judgeData?.phone || "—"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 1 }} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
                <Divider orientation="vertical" sx={{ borderColor: colors.BORDER }} />
              </Grid>

              {/* Stats & Expertise */}
              <Grid size={{ xs: 12, md: 6, lg: 7 }}>
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: colors.TEXT_PRIMARY, display: "flex", alignItems: "center", gap: 1 }}>
                    <StarOutline color="primary" /> Professional Expertise
                  </Typography>
                  
                  {judgeData?.judgeProfile?.expertise?.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
                      {judgeData.judgeProfile.expertise.map((exp: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={exp}
                          sx={{
                            bgcolor: `${colors.PRIMARY}10`,
                            color: colors.PRIMARY,
                            fontWeight: 600,
                            borderRadius: "8px",
                            px: 1,
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, mb: 4, fontStyle: "italic" }}>
                      No expertise specified.
                    </Typography>
                  )}

                  <Divider sx={{ mb: 4, borderColor: colors.BORDER }} />

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: `1px solid ${colors.BORDER}` }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: colors.TEXT_SECONDARY }}>
                          <AssignmentTurnedInOutlined fontSize="small" />
                          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                            Assigned Entries
                          </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
                          {entryAssignments.length}
                        </Typography>
                      </Box>
                    </Grid>
                    {/* Add more stats here in the future if needed */}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Card>

          <Card
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              border: `1px solid ${colors.BORDER}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <AssignmentTurnedInOutlined sx={{ color: colors.PRIMARY }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Entry Assignments
              </Typography>
            </Box>

            <JudgeAssignmentsTable 
              entryAssignments={entryAssignments} 
              judge={{ id: judgeData?.id, name: fullName }}
            />
          </Card>
        </Stack>
      )}
    </Box>
  );
};

export default JudgeDetailsPage;

