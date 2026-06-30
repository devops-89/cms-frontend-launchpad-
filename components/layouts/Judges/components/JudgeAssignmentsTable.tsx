import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useModal } from "@/store/useModal";
import { usePermissions } from "@/context/PermissionContext";
import { roboto } from "@/utils/fonts";
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon, Assignment as AssignmentIcon, Close as CloseIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Divider
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useMemo, useState } from "react";
import AssignJudgesDialog from "./AssignJudgesDialog";

const EntryChipName = ({ entryId, contestId, fallbackTitle }: { entryId: string, contestId: string, fallbackTitle: string }) => {
  const { data } = useQuery({
    queryKey: ["entry-title", contestId, entryId],
    queryFn: () => entryControllers.getEntryById(contestId, entryId),
    enabled: !!entryId && !!contestId && (fallbackTitle.startsWith("Entry #") || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/.test(fallbackTitle)),
    staleTime: 60000,
  });

  const entryData = data?.data || data;
  let title = fallbackTitle;
  if (entryData) {
    let sData = entryData.submission?.data?.data || entryData.submission?.data || entryData.submissionData || entryData.data || entryData.submission || entryData;
    if (typeof sData === 'string') {
      try { sData = JSON.parse(sData); } catch (e) {}
    }
    const resolvedTitle = sData?.["Innovation Title"] || sData?.lwiwu56nx || sData?.name_1 || sData?.ho1p00z0q || sData?.title || sData?.zvdskzwrw;
    if (resolvedTitle) {
      title = resolvedTitle;
    }
  }

  return <>{title}</>;
};

interface JudgeAssignmentsTableProps {
  entryAssignments: any[];
  judge: { id: string; name: string };
}

const JudgeAssignmentsTable: React.FC<JudgeAssignmentsTableProps> = ({ entryAssignments, judge }) => {
  const { colors } = useAppTheme();
  const { showModal, hideModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canEditJudges = hasPermission("Judges", "canEdit");
  const canDeleteJudges = hasPermission("Judges", "canDelete");
  const canViewContests = hasPermission("Contests", "canView");

  const [deleteGroup, setDeleteGroup] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedContestGroup, setSelectedContestGroup] = useState<any>(null);

  const groupedAssignments = useMemo(() => {
    const groups: Record<string, any> = {};
    entryAssignments.forEach((assignment: any) => {
      const contestId = assignment.contest_id;
      if (!groups[contestId]) {
        groups[contestId] = {
          contest: assignment.contest,
          entries: [],
          entry_ids: [],
          assigned_at: assignment.assigned_at,
          assignment_ids: [],
        };
      }

      const contest = assignment.contest || {};
      const entryFields = contest?.entry_level_template?.schema?.fields || contest?.entryLevelTemplate?.schema?.fields || [];
      const entryData = assignment.entry || assignment.entries || assignment.contest_entry || assignment.contestEntry || {};
      let sData = entryData.submission?.data?.data || entryData.submission?.data || entryData.submissionData || entryData.data || entryData.submission || entryData;
      if (typeof sData === 'string') {
        try { sData = JSON.parse(sData); } catch (e) {}
      }
      
      // Some API responses stringify the inner data too
      if (sData?.data && typeof sData.data === 'string') {
        try { sData.data = JSON.parse(sData.data); } catch(e) {}
      }
      if (sData?.data && typeof sData.data === 'object') {
        sData = { ...sData, ...sData.data };
      }

      let entryTitle = "";
      if (assignment.entry_id) {
        // Try exact match first
        const innovationTitleField = entryFields?.find((f: any) => 
          f.label?.trim().toLowerCase() === "innovation title"
        );
        
        if (innovationTitleField && sData) {
          entryTitle = sData[innovationTitleField.label] || sData[innovationTitleField.id] || sData[innovationTitleField.label?.trim()];
        }
        
        // Fallback to fuzzy match
        if (!entryTitle) {
          const entryTitleField = entryFields?.find((f: any) => {
            const l = f.label?.toLowerCase() || "";
            return l.includes("title") || l.includes("project") || l.includes("name");
          });
          if (entryTitleField && sData) {
            entryTitle = sData[entryTitleField.label] || sData[entryTitleField.id] || sData[entryTitleField.label?.trim()];
          }
        }
        
        if (!entryTitle) {
          entryTitle = sData?.["Innovation Title"] || sData?.lwiwu56nx || sData?.name_1 || sData?.ho1p00z0q || sData?.title || sData?.zvdskzwrw;
        }
        if (!entryTitle && sData) {
          const values = Object.entries(sData)
            .filter(([k, v]: [string, any]) => !["status", "isdraft"].includes(k.toLowerCase()) && typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v))
            .map(([k, v]) => v);
          if (values.length > 0) entryTitle = values[0] as string;
        }
        if (!entryTitle) {
          entryTitle = assignment.entry_title || assignment.title || assignment.entryName || assignment.name || `Entry #${assignment.entry_id?.substring(0, 8) || "Untitled"}`;
        }
      } else {
        entryTitle = "All Entries";
      }

      groups[contestId].entries.push(entryTitle);
      if (assignment.entry_id) {
        groups[contestId].entry_ids.push(assignment.entry_id);
      }
      groups[contestId].assignment_ids.push(assignment.id);
    });
    return Object.values(groups);
  }, [entryAssignments]);

  const handleDelete = async () => {
    if (!deleteGroup) return;
    try {
      setDeleteLoading(true);
      await contestControllers.deleteJudgeAssignments(deleteGroup.contest.id, judge.id);
      showSnackbar("Assignments deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["judge-details"] });
      queryClient.invalidateQueries({ queryKey: ["judges"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      setDeleteGroup(null);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete assignments";
      showSnackbar(errorMessage, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredGroups = groupedAssignments.filter((g: any) => g.entries && g.entries.length > 0);

  if (!entryAssignments || entryAssignments.length === 0 || filteredGroups.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center", bgcolor: "rgba(0,0,0,0.02)", borderRadius: 2 }}>
        <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY }}>
          No entries assigned to judge.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer sx={{ border: `1px solid ${colors.BORDER}`, borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
            <TableRow>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Contest</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Entries</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Assigned At</Typography>
              </TableCell>
              {(canEditJudges || canDeleteJudges) && (
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Actions</Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGroups.map((group: any, idx: number) => (
              <TableRow 
                key={idx} 
                hover
                onClick={() => setSelectedContestGroup(group)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {group.contest?.name || "Unknown Contest"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(0,0,0,0.04)",
                      color: colors.TEXT_PRIMARY,
                      fontWeight: 700,
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      fontSize: "0.85rem",
                    }}
                  >
                    {group.entries.length}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
                    {moment(group.assigned_at).format("MMM DD, YYYY")}
                  </Typography>
                </TableCell>
                {(canEditJudges || canDeleteJudges) && (
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {canEditJudges && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            showModal(
                              <AssignJudgesDialog
                                open={true}
                                onClose={hideModal}
                                judges={[judge]}
                                initialContestId={group.contest?.id}
                                initialSelectedEntryIds={group.entry_ids}
                              />
                            );
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDeleteJudges && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteGroup(group)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!deleteGroup} onClose={() => !deleteLoading && setDeleteGroup(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to delete this contest assign to judge?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteGroup(null)} disabled={deleteLoading}>
            No
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained" 
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} color="inherit" /> : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={!!selectedContestGroup} 
        onClose={() => setSelectedContestGroup(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.TEXT_PRIMARY }}>
              Assigned Entries
            </Typography>
            <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}>
              {selectedContestGroup?.contest?.name || "Unknown Contest"}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedContestGroup(null)} size="small" sx={{ bgcolor: "rgba(0,0,0,0.04)" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ bgcolor: "rgba(0,0,0,0.01)", p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {selectedContestGroup?.entries.map((entryTitle: string, i: number) => (
              <Box
                key={i}
                onClick={() => {
                  if (!canViewContests) {
                    showSnackbar("You do not have permission to view entry details", "error");
                    return;
                  }
                  const entryId = selectedContestGroup.entry_ids[i];
                  if (entryId) {
                    window.location.href = `/contest-management/entries/${entryId}?contestId=${selectedContestGroup.contest?.id}`;
                  } else {
                    window.location.href = `/contest-management/contests/${selectedContestGroup.contest?.id}`;
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  bgcolor: "white",
                  borderRadius: 2,
                  border: `1px solid ${colors.BORDER}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: colors.PRIMARY,
                    bgcolor: `${colors.PRIMARY}05`,
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: `${colors.PRIMARY}15`,
                    color: colors.PRIMARY
                  }}
                >
                  <AssignmentIcon fontSize="small" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>
                    {selectedContestGroup.entry_ids[i] && (entryTitle.startsWith("Entry #") || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/.test(entryTitle)) ? (
                      <EntryChipName entryId={selectedContestGroup.entry_ids[i]} contestId={selectedContestGroup.contest?.id} fallbackTitle={entryTitle} />
                    ) : (
                      entryTitle
                    )}
                  </Typography>
                </Box>
                <VisibilityIcon sx={{ color: colors.TEXT_SECONDARY, fontSize: 18 }} />
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JudgeAssignmentsTable;
