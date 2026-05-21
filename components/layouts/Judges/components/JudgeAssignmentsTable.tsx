import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";
import moment from "moment";
import { roboto } from "@/utils/fonts";
import { useModal } from "@/store/useModal";
import AssignJudgesDialog from "./AssignJudgesDialog";

interface JudgeAssignmentsTableProps {
  entryAssignments: any[];
  judge: { id: string; name: string };
}

const JudgeAssignmentsTable: React.FC<JudgeAssignmentsTableProps> = ({ entryAssignments, judge }) => {
  const { colors } = useAppTheme();
  const { showModal, hideModal } = useModal();

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

      const entryData = assignment.entry?.submission?.data;
      const entryTitle = entryData?.name_1 || entryData?.ho1p00z0q || (entryData ? Object.values(entryData)[0] : "Untitled");

      groups[contestId].entries.push(entryTitle);
      groups[contestId].entry_ids.push(assignment.entry_id);
      groups[contestId].assignment_ids.push(assignment.id);
    });
    return Object.values(groups);
  }, [entryAssignments]);

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
                    <Chip key={i} label={entryTitle} size="small" variant="outlined" />
                  ))}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
                  {moment(group.assigned_at).format("MMM DD, YYYY")}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  color="primary"
                  startIcon={<EditIcon fontSize="small" />}
                  sx={{ textTransform: "capitalize", fontFamily: roboto.style.fontFamily }}
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
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JudgeAssignmentsTable;
