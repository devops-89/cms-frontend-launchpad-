"use client";

import JudgePanelLayout from "@/components/layouts/JudgePanel";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, IconButton, Menu, MenuItem, Chip } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useAppTheme } from "@/context/ThemeContext";
import { roboto } from "@/utils/fonts";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { judgeControllers } from "@/api/judgeControllers";

const ActionMenu = ({ entryId, contestId, status, colors, score }: { entryId: string, contestId: string, status: string, colors: any, score: any }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleClose();
    if (action === 'view') {
      router.push(`/judge-panel/entries/${entryId}?mode=view&contestId=${contestId}&status=${status}`);
    } else if (action === 'evaluate') {
      router.push(`/judge-panel/entries/${entryId}?mode=evaluate&contestId=${contestId}&status=${status}`);
    } else if (action === 'edit') {
      router.push(`/judge-panel/entries/${entryId}?mode=edit&contestId=${contestId}&status=${status}`);
    }
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleAction('view')}>View</MenuItem>
        {(score === null || score === undefined || score === 0) ? (
          status?.toLowerCase() === 'approved' && (
            <MenuItem onClick={() => handleAction('evaluate')}>Evaluate</MenuItem>
          )
        ) : (
          <MenuItem onClick={() => handleAction('edit')}>Edit Evaluation</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default function JudgeEntriesPage() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const result = await judgeControllers.getAssignedEntries(1, 50);
        setEntries(result.data?.docs || []);
      } catch (err) {
        console.error("Failed to fetch entries", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, []);

  return (
    <JudgePanelLayout>
      <Box>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Breadcrumb
            title="My Entries"
            data={[
              { title: "Dashboard", href: "/judge-panel/dashboard" },
              { title: "My Entries", href: "#" },
            ]}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${colors.BORDER}`, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contest</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Public Votes</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      {(() => {
                        const submissionData = entry.entry?.submission?.data || {};
                        const sData = submissionData?.data ? submissionData.data : submissionData;
                        
                        const entryFields = entry.contest?.entry_level_template?.schema?.fields || entry.contest?.entryLevelTemplate?.schema?.fields || [];
                        const userFields = entry.contest?.user_level_template?.schema?.fields || entry.contest?.userLevelTemplate?.schema?.fields || [];
                        
                        let titleField = entryFields.find((f: any) => f.label?.toLowerCase().includes("title") || f.label?.toLowerCase().includes("project") || f.label?.toLowerCase().includes("startup"));
                        if (!titleField) {
                          titleField = userFields.find((f: any) => f.label?.toLowerCase().includes("name"));
                        }
                        
                        let title = "";
                        if (titleField) {
                          title = sData[titleField.label] || sData[titleField.id];
                        }
                        if (!title) {
                          title = sData["ho1p00z0q"] || sData["Innovation Title"] || sData["zvdskzwrw"];
                        }
                        if (!title) {
                          const values = Object.values(sData).filter(v => 
                            typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v as string)
                          );
                          if (values.length > 0) title = values[0] as string;
                          else title = `Entry #${entry.entry_id?.substring(0, 8) || entry.id?.substring(0, 8)}`;
                        }
                        if (!title) title = "Untitled";

                        return title;
                      })()}
                    </TableCell>
                    <TableCell>{entry.contest?.name || "N/A"}</TableCell>
                    <TableCell>
                      {(() => {
                        const displayStatus = entry.entry?.status || entry.status;
                        const isEvaluatedBackend = entry.status === 'evaluated' || displayStatus === 'evaluated' || (entry.score !== undefined && entry.score !== null && entry.score > 0) || (entry.entry?.score !== undefined && entry.entry?.score !== null && entry.entry?.score > 0);
                        
                        const getStatusColor = (status: string) => {
                          const lower = status.toLowerCase();
                          if (lower === "draft") return { bg: "#f1f5f9", text: "#475569" };      // Slate
                          if (lower === "pending") return { bg: "#fef3c7", text: "#b45309" };    // Amber
                          if (lower === "approved") return { bg: "#d1fae5", text: "#047857" };   // Emerald
                          if (lower === "rejected") return { bg: "#fee2e2", text: "#b91c1c" };   // Red
                          if (lower === "evaluated") return { bg: "#e0f2fe", text: "#0369a1" };  // Sky Blue
                          if (lower === "semifinal") return { bg: "#f3e8ff", text: "#6b21a8" };  // Purple
                          if (lower === "final") return { bg: "#fce7f3", text: "#be185d" };      // Pink
                          if (lower === "winner") return { bg: "#fef08a", text: "#a16207" };     // Gold
                          return { bg: "#f8fafc", text: "#64748b" };
                        };

                        const currentStatus = isEvaluatedBackend ? "evaluated" : (displayStatus || "pending");
                        const statusColors = getStatusColor(currentStatus);

                        let uiStatus = displayStatus || "Pending";
                        if (isEvaluatedBackend) {
                          uiStatus = "Evaluated";
                        } else if (uiStatus.toLowerCase() === "approved") {
                          uiStatus = "Moderate";
                        }

                        return (
                          <Chip
                            label={uiStatus}
                            size="small"
                            sx={{
                              bgcolor: statusColors.bg,
                              color: statusColors.text,
                              fontWeight: 700,
                              borderRadius: "6px",
                              textTransform: "capitalize",
                              fontSize: "0.75rem",
                              height: 24,
                            }}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "secondary.main" }}>
                      {entry.score !== undefined && entry.score !== null ? entry.score : (entry.total_score !== undefined && entry.total_score !== null ? entry.total_score : 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                      {entry.entry?.voteCount !== undefined ? entry.entry.voteCount : 0}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const vp = entry.contest?.votingPeriods?.find((v: any) => v.voting_type === "JUDGE") || entry.contest?.votingPeriods?.[0];
                        return vp?.start_date ? new Date(vp.start_date).toLocaleDateString() : "N/A";
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const vp = entry.contest?.votingPeriods?.find((v: any) => v.voting_type === "JUDGE") || entry.contest?.votingPeriods?.[0];
                        return vp?.end_date ? new Date(vp.end_date).toLocaleDateString() : "N/A";
                      })()}
                    </TableCell>
                    <TableCell>
                      <ActionMenu entryId={entry.entry_id || entry.id} contestId={entry.contest_id || entry.contest?.id} status={entry.entry?.status || entry.status} colors={colors} score={entry.score !== undefined && entry.score !== null ? entry.score : entry.total_score} />
                    </TableCell>
                  </TableRow>
                ))}
                {entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No entries assigned to you yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </JudgePanelLayout>
  );
}
