"use client";
import { contestControllers } from "@/api/contestControllers";
import { useAppTheme } from "@/context/ThemeContext";
import { useContestDetails } from "@/store/useContestDetails";
import { ContestParticipant, ContestTemplateField } from "@/types/user";
import { roboto } from "@/utils/fonts";
import {
  Delete,
  Edit,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/context/SnackbarContext";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const ParticipantsList = () => {
  const router = useRouter();
  const params = useParams();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string;

  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [isDense, setIsDense] = useState(false);
  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<ContestParticipant | null>(null);

  const deleteParticipantMutation = useMutation({
    mutationFn: () => contestControllers.deleteParticipant(id, participantToDelete?.id as string),
    onSuccess: () => {
      showSnackbar("Participant deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["contest-details", id] });
      setDeleteDialogOpen(false);
      setParticipantToDelete(null);
    },
    onError: (error: unknown) => {
      console.error(error);
      const err = error as any;
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to delete participant";
      showSnackbar(errorMessage, "error");
    },
  });

  const { contest } = useContestDetails();
  const fields = contest?.userLevelTemplate?.schema?.fields || [];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: participantsData, isPending } = useQuery({
    queryKey: ["participants", id, page, rowsPerPage],
    queryFn: () => contestControllers.getAllParticipants(id, page + 1, rowsPerPage),
    enabled: !!id,
  });

  const participants = Array.isArray(participantsData?.data?.docs)
    ? participantsData.data.docs
    : Array.isArray(participantsData?.data?.data)
      ? participantsData.data.data
      : Array.isArray(participantsData?.data)
        ? participantsData.data
        : [];
        
  const total = participantsData?.data?.totalDocs || participantsData?.data?.total || participantsData?.data?.meta?.total || participants.length;
  
  React.useEffect(() => {
    if (participants.length > 0) {
      console.log("DEBUG Participants Data:", participants);
    }
  }, [participants]);

  const dynamicColumns = useMemo(() => {
    const cols: { id: string; label: string }[] = [];
    let nameAdded = false;

    fields.forEach((field: ContestTemplateField) => {
      const label = field.label?.toLowerCase() || "";
      const isNameField = label.includes("first name") || label.includes("last name") || label === "first" || label === "last" || label.includes("name");
      
      if (isNameField) {
        if (!nameAdded) {
          cols.push({ id: "composite_name", label: "Name" });
          nameAdded = true;
        }
      } else {
        cols.push({ id: field.id, label: field.label });
      }
    });

    // If no name field was found, add it as the first column anyway
    if (!nameAdded) {
      cols.unshift({ id: "composite_name", label: "Name" });
    }

    return cols;
  }, [fields]);

  const allColumns = useMemo(() => {
    return [
      ...dynamicColumns,
      { id: "status", label: "Status" },
      { id: "joined_at", label: "Joined At" },
      { id: "actions", label: "Actions" },
    ];
  }, [dynamicColumns]);

  useEffect(() => {
    if (allColumns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(allColumns.map((col) => col.id));
    }
  }, [allColumns]);

  const handleCloseColumnMenu = () => {
    setColumnAnchorEl(null);
  };

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((colId) => colId !== columnId)
        : [...prev, columnId],
    );
  };

  const visibleHeaders = useMemo(() => {
    return allColumns.filter((col) => visibleColumns.includes(col.id));
  }, [allColumns, visibleColumns]);

  const handleOpenColumnMenu = (event: React.MouseEvent<HTMLElement>) => {
    setColumnAnchorEl(event.currentTarget);
  };

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <IconButton onClick={handleOpenColumnMenu}>
          <MoreIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={columnAnchorEl}
        open={Boolean(columnAnchorEl)}
        onClose={handleCloseColumnMenu}
        PaperProps={{
          sx: { maxHeight: 400, width: 250, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.BORDER}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Column Preferences
          </Typography>
        </Box>
        {allColumns.map((col) => (
          <MenuItem key={col.id} onClick={() => toggleColumn(col.id)} sx={{ py: 1 }}>
            <Checkbox size="small" checked={visibleColumns.includes(col.id)} sx={{ p: 0, mr: 1.5 }} />
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>
              {col.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      <Paper sx={{ border: `1px solid ${colors.BORDER}`, borderRadius: 2, overflowX: "auto" }} elevation={0}>
        <Table sx={{ mt: 0, minWidth: 800 }} size={isDense ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
              {visibleHeaders.map((h) => (
                <TableCell key={h.id} align={h.id === "actions" ? "right" : "left"}>
                  <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily, fontSize: 14, whiteSpace: "nowrap" }}>
                    {h.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant: ContestParticipant) => (
              <TableRow
                key={participant.id}
                sx={{
                  "&:hover": { bgcolor: "rgba(0,0,0,0.01)" },
                  "& .MuiTableCell-root": { borderBottom: `1px solid ${colors.BORDER}`, py: isDense ? 1 : 2 },
                }}
              >
                {dynamicColumns
                  .filter((col) => visibleColumns.includes(col.id))
                  .map((col) => {
                    let displayValue = "—";

                    if (col.id === "composite_name") {
                      const firstNameField = fields.find((f: ContestTemplateField) => {
                        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
                        return l.includes("firstname") || l === "first";
                      });
                      const lastNameField = fields.find((f: ContestTemplateField) => {
                        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
                        return l.includes("lastname") || l === "last";
                      });
                      const fullNameField = fields.find((f: ContestTemplateField) => {
                        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
                        return l.includes("fullname") || l === "name" || (l.includes("name") && !l.includes("first") && !l.includes("last"));
                      });

                      const rawData = participant.submission?.data;
                      const formData = rawData?.data || rawData || (participant as any).data || (participant as any).participant_profile_data || {};
                      const firstName = firstNameField ? (formData[firstNameField.label] || formData[firstNameField.id]) : "";
                      const lastName = lastNameField ? (formData[lastNameField.label] || formData[lastNameField.id]) : "";
                      const fullName = fullNameField ? (formData[fullNameField.label] || formData[fullNameField.id]) : "";

                      if (firstName || lastName) {
                        displayValue = `${firstName || ""} ${lastName || ""}`.trim();
                      } else if (fullName) {
                        displayValue = fullName;
                      } else if (participant.submission?.data?.yg9snrxlh) {
                        displayValue = participant.submission.data.yg9snrxlh;
                      } else {
                        // Fallback: try to find ANY field that has "name" in it
                        const fallbackNameField = fields.find((f: ContestTemplateField) => f.label?.toLowerCase().includes("name"));
                        if (fallbackNameField && (formData[fallbackNameField.label] || formData[fallbackNameField.id])) {
                          displayValue = formData[fallbackNameField.label] || formData[fallbackNameField.id];
                        }
                      }
                    } else {
                      const field = fields.find((f: ContestTemplateField) => f.id === col.id);
                      const rawData = participant.submission?.data;
                      const formData = rawData?.data || rawData || (participant as any).data || (participant as any).participant_profile_data || {};
                      const rawValue = formData[col.label] || formData[col.id];
                      displayValue = rawValue || "—";

                      if (field?.type === "datePicker" && rawValue) {
                        displayValue = moment(rawValue).format("MMM DD, YYYY");
                      }
                    }

                    return (
                      <TableCell key={col.id}>
                        <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY, fontSize: 13, whiteSpace: "nowrap" }}>
                          {displayValue}
                        </Typography>
                      </TableCell>
                    );
                  })}
                {visibleColumns.includes("status") && (
                  <TableCell>
                    {(() => {
                      const rawData = participant.submission?.data;
                      const formData = rawData?.data || rawData || (participant as any).data || (participant as any).participant_profile_data || {};
                      const displayStatus = formData.status || participant.status || "Unknown";
                      const isPending = displayStatus.toLowerCase() === "pending";
                      
                      return (
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "capitalize",
                            px: 1,
                            py: 0.5,
                            borderRadius: "6px",
                            bgcolor: isPending ? "#fef3c7" : "#dcfce7",
                            color: isPending ? "#92400e" : "#166534",
                            width: "fit-content",
                          }}
                        >
                          {displayStatus}
                        </Typography>
                      );
                    })()}
                  </TableCell>
                )}
                {visibleColumns.includes("joined_at") && (
                  <TableCell>
                    <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY, fontSize: 13, whiteSpace: "nowrap" }}>
                      {participant.joined_at ? moment(participant.joined_at).format("MMM DD, YYYY") : "—"}
                    </Typography>
                  </TableCell>
                )}
                {visibleColumns.includes("actions") && (
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{ color: colors.TEXT_SECONDARY }}
                        onClick={() => router.push(`/contest-management/contests/${contest?.id}/edit-user?participantId=${participant.id}`)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ color: colors.TEXT_SECONDARY }}
                        onClick={() => {
                          setParticipantToDelete(participant);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {participants.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleHeaders.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No participants found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <TablePagination
        component="div"
        count={total || 0}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      <Box sx={{ mt: 2, px: 1 }}>
        <FormControlLabel
          control={<Switch checked={isDense} onChange={(e) => setIsDense(e.target.checked)} size="small" />}
          label={<Typography variant="body2">Dense View</Typography>}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 700 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this participant? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => deleteParticipantMutation.mutate()}
            color="error"
            variant="contained"
            disabled={deleteParticipantMutation.isPending}
            startIcon={deleteParticipantMutation.isPending && <CircularProgress size={16} color="inherit" />}
          >
            {deleteParticipantMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParticipantsList;
