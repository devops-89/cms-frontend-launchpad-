import { contestControllers } from "@/api/contestControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useModal } from "@/store/useModal";
import { roboto } from "@/utils/fonts";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
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
  Typography
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useMemo, useState } from "react";
import AssignJudgesDialog from "./AssignJudgesDialog";

interface JudgeAssignmentsTableProps {
  entryAssignments: any[];
  judge: { id: string; name: string };
}

const JudgeAssignmentsTable: React.FC<JudgeAssignmentsTableProps> = ({ entryAssignments, judge }) => {
  const { colors } = useAppTheme();
  const { showModal, hideModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [deleteGroup, setDeleteGroup] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      const submissionData = assignment.entry?.submission?.data || {};
      const sData = submissionData?.data ? submissionData.data : submissionData;

      let entryTitle = "";
      const entryTitleField = entryFields?.find((f: any) => {
        const l = f.label?.toLowerCase() || "";
        return l.includes("title") || l.includes("project");
      });
      if (entryTitleField && sData) {
        entryTitle = sData[entryTitleField.label] || sData[entryTitleField.id];
      }
      if (!entryTitle) {
        entryTitle = sData?.name_1 || sData?.ho1p00z0q || sData?.["Innovation Title"] || sData?.zvdskzwrw;
      }
      if (!entryTitle && sData) {
        const values = Object.entries(sData)
          .filter(([k, v]: [string, any]) => !["status", "isdraft"].includes(k.toLowerCase()) && typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v))
          .map(([k, v]) => v);
        if (values.length > 0) entryTitle = values[0] as string;
      }
      if (!entryTitle) entryTitle = `Entry #${assignment.entry_id?.substring(0, 8) || "Untitled"}`;

      groups[contestId].entries.push(entryTitle);
      groups[contestId].entry_ids.push(assignment.entry_id);
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

  if (!entryAssignments || entryAssignments.length === 0) {
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
              <TableCell align="right">
                <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedAssignments.map((group: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {group.contest?.name || "Unknown Contest"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, max-content)", gap: 1 }}>
                    {group.entries.map((entryTitle: string, i: number) => (
                      <Chip 
                        key={i} 
                        label={entryTitle} 
                        size="small" 
                        variant="outlined" 
                        onClick={() => {
                          window.location.href = `/contest-management/entries/${group.entry_ids[i]}?contestId=${group.contest?.id}`;
                        }}
                        sx={{ 
                          cursor: 'pointer', 
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } 
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
                    {moment(group.assigned_at).format("MMM DD, YYYY")}
                  </Typography>
                </TableCell>
                <TableCell align="right">
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
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteGroup(group)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
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
    </>
  );
};

export default JudgeAssignmentsTable;
