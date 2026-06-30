"use client";

import { contestControllers } from "@/api/contestControllers";
import { UserController } from "@/api/userControllers";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import StatCard from "@/components/dashboard/StatCard";
import DashboardLayout from "@/components/layouts/Dashboard";
import { useAppTheme } from "@/context/ThemeContext";
import { UserRole, UserStatus } from "@/utils/enum";
import { roboto } from "@/utils/fonts";
import {
  ArrowForward as ArrowForwardIcon,
  EmojiEvents as ContestIcon,
  Event as EventIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/context/PermissionContext";
import { SIDEBAR } from "@/utils/constant";
import React from "react";

export default function DashboardPage() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { hasPermission, isAdmin, isLoading: isPermissionsLoading } = usePermissions();

  React.useEffect(() => {
    if (!isPermissionsLoading && !isAdmin) {
      let firstRoute = "";
      for (const item of SIDEBAR) {
        if (!item || !item.label) continue;
        if (item.label === "Dashboard") continue;
        if (item.label === "Permission Management") continue;

        if (item.subModules && item.subModules.length > 0) {
          const permittedSub = item.subModules.find((sub: any) => hasPermission(sub.label, "canView"));
          if (permittedSub && permittedSub.href) {
            firstRoute = permittedSub.href;
            break;
          }
        } else {
          if (hasPermission(item.label, "canView") && item.href) {
            firstRoute = item.href;
            break;
          }
        }
      }

      if (firstRoute) {
        router.replace(firstRoute);
      }
    }
  }, [isAdmin, isPermissionsLoading, hasPermission, router]);

  // Fetch contests (large limit to get all live data for overview)
  const { data: contestsData, isPending: isContestsPending } = useQuery({
    queryKey: ["contests", "all-dashboard"],
    queryFn: () => contestControllers.getContest(1, 1000),
  });
  const contestsList = Array.isArray(contestsData?.data?.docs) ? contestsData.data.docs : [];

  // Fetch participants (large limit to get all live data for overview)
  const { data: participantsData, isPending: isParticipantsPending } = useQuery({
    queryKey: ["participants", "all-dashboard"],
    queryFn: () => UserController.getAllUser(UserRole.PARTICIPANT, 1, 1000),
  });

  const participants = React.useMemo(() => {
    const rawData = participantsData?.data?.data;
    return rawData?.users ? rawData.users : (Array.isArray(rawData) ? rawData : []);
  }, [participantsData]);

  const activeContestsCount = contestsList.filter(
    (c: any) => c.status === UserStatus.PUBLISHED
  ).length;

  const totalParticipantsCount = participants?.length || 0;

  const upcomingEventsCount = contestsList.filter(
    (c: any) => moment(c.start_date).isAfter(moment())
  ).length;

  const totalEntries = contestsList.reduce(
    (acc: number, c: any) => acc + (c.entryCount || c.total_entries || c.entries || 0),
    0
  );
  
  const avgEngagement =
    totalParticipantsCount > 0
      ? Math.min(Math.round((totalEntries / totalParticipantsCount) * 100), 100)
      : 0;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "approved":
      case "published":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#16a34a", border: "1px solid rgba(22, 163, 74, 0.2)" };
      case "pending":
      case "draft":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#ea580c", border: "1px solid rgba(234, 88, 12, 0.2)" };
      case "banned":
      case "rejected":
        return { bgcolor: "rgba(220, 38, 38, 0.1)", color: "#dc2626", border: "1px solid rgba(220, 38, 38, 0.2)" };
      default:
        return { bgcolor: "rgba(107, 114, 128, 0.1)", color: "#6b7280", border: "1px solid rgba(107, 114, 128, 0.2)" };
    }
  };

  const recentParticipants = React.useMemo(() => {
    return [...participants]
      .sort((a, b) => {
        const dateA = a.created_at || a.createdAt || a.joined_at || a.joinedAt || "";
        const dateB = b.created_at || b.createdAt || b.joined_at || b.joinedAt || "";
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  }, [participants]);

  const recentContests = React.useMemo(() => {
    return contestsList
      .filter((c: any) => c.status?.toLowerCase() === "draft" || c.status?.toLowerCase() === "published")
      .sort((a: any, b: any) => {
        const dateA = a.created_at || a.createdAt || "";
        const dateB = b.created_at || b.createdAt || "";
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  }, [contestsList]);

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

  const isLoadingData = isContestsPending || isParticipantsPending;

  if (isPermissionsLoading || !isAdmin) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

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
            Welcome back, Admin! Here's a snapshot of your platform's performance.
          </Typography>
        </Box>

        {isLoadingData ? (
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

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Recent Registrations Card */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: `1px solid ${colors.BORDER}`,
                    bgcolor: colors.SURFACE,
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
                      Recent Registrations
                    </Typography>
                    <Button
                      variant="text"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => router.push("/user-management/users")}
                      sx={{ textTransform: "none", fontWeight: 600, color: colors.PRIMARY }}
                    >
                      View All
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table sx={{ minWidth: 600 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: colors.TEXT_SECONDARY }}>User</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: colors.TEXT_SECONDARY }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: colors.TEXT_SECONDARY }}>Registered</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: colors.TEXT_SECONDARY }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: colors.TEXT_SECONDARY }} align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentParticipants.map((p: any) => {
                          const fullName = p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Unknown User";
                          const regDate = p.created_at || p.createdAt || p.joined_at || p.joinedAt;
                          
                          return (
                            <TableRow key={p.id} sx={{ "&:hover": { bgcolor: "rgba(99, 102, 241, 0.02)" } }}>
                              <TableCell sx={{ py: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                  <Avatar 
                                    src={p.avatarUrl || p.participantProfile?.avatarUrl} 
                                    sx={{ width: 36, height: 36, bgcolor: colors.PRIMARY, fontWeight: 700, fontSize: "0.85rem" }}
                                  >
                                    {fullName[0].toUpperCase()}
                                  </Avatar>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.TEXT_PRIMARY }}>
                                    {fullName}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}>
                                  {p.email}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}>
                                  {regDate ? moment(regDate).format("MMM DD, YYYY") : "—"}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Chip 
                                  label={p.status || "Pending"} 
                                  size="small" 
                                  sx={{ 
                                    ...getStatusColor(p.status), 
                                    fontWeight: 700, 
                                    fontSize: "0.7rem", 
                                    borderRadius: "6px" 
                                  }} 
                                />
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }} align="right">
                                <Button 
                                  variant="outlined" 
                                  size="small" 
                                  onClick={() => router.push(`/user-management/users/${p.id}`)}
                                  sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, py: 0.25, px: 1.5, borderRadius: 1.5 }}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {recentParticipants.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary">No recent registrations.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Contest Standings Card */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: `1px solid ${colors.BORDER}`,
                    bgcolor: colors.SURFACE,
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)",
                    height: "fit-content",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
                      Contests Overview
                    </Typography>
                    <Button
                      variant="text"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => router.push("/contest-management/contests")}
                      sx={{ textTransform: "none", fontWeight: 600, color: colors.PRIMARY }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
                    {recentContests.map((c: any) => {
                      const entriesCount = c.entryCount || c.total_entries || c.entries || 0;
                      return (
                        <Box 
                          key={c.id} 
                          sx={{ 
                            p: 2, 
                            border: `1px solid ${colors.BORDER}`, 
                            borderRadius: 3, 
                            bgcolor: "rgba(0,0,0,0.01)",
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: colors.PRIMARY,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
                            }
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY, pr: 1 }} noWrap>
                              {c.name}
                            </Typography>
                            <Chip 
                              label={c.status} 
                              size="small" 
                              sx={{ 
                                ...getStatusColor(c.status), 
                                fontWeight: 700, 
                                fontSize: "0.65rem", 
                                borderRadius: "4px",
                                height: 18
                              }} 
                            />
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}>
                              {moment(c.start_date).format("MMM DD")} - {moment(c.end_date).format("MMM DD, YYYY")}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: colors.PRIMARY }}>
                              {entriesCount} {entriesCount === 1 ? "entry" : "entries"}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    {recentContests.length === 0 && (
                      <Box sx={{ py: 4, textAlign: "center", my: "auto" }}>
                        <Typography variant="body2" color="text.secondary">No contests found.</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
