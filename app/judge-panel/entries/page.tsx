"use client";

import JudgePanelLayout from "@/components/layouts/JudgePanel";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, IconButton, Menu, MenuItem } from "@mui/material";
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
        {(score === null || score === undefined) ? (
          <MenuItem onClick={() => handleAction('evaluate')}>Evaluate</MenuItem>
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
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          bgcolor: entry.status === 'evaluated' ? 'rgba(76, 175, 80, 0.1)' : entry.status === 'approved' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                          color: entry.status === 'evaluated' ? '#4caf50' : entry.status === 'approved' ? '#2196f3' : '#ff9800',
                          border: `1px solid ${entry.status === 'evaluated' ? 'rgba(76, 175, 80, 0.2)' : entry.status === 'approved' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 152, 0, 0.2)'}`,
                        }}
                      >
                        {entry.status === 'approved' ? 'Moderate' : entry.status === 'evaluated' ? 'Evaluated' : entry.status || "Pending"}
                      </Box>
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
                      <ActionMenu entryId={entry.entry_id || entry.id} contestId={entry.contest_id || entry.contest?.id} status={entry.status} colors={colors} score={entry.score} />
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
