"use client";
import { contestControllers } from "@/api/contestControllers";
import { usePermissions } from "@/context/PermissionContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useContestDetails } from "@/store/useContestDetails";
import { ContestParticipant, ContestTemplateField } from "@/types/user";
import { roboto } from "@/utils/fonts";
import {
  Delete,
  Edit,
  MoreVert as MoreIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const { hasPermission } = usePermissions();
  const canViewParticipant = hasPermission("Contests", "canView");
  const canEditParticipant = hasPermission("Contests", "canEdit");
  const canDeleteParticipant = hasPermission("Contests", "canDelete");

  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<ContestParticipant | null>(null);

  const deleteParticipantMutation = useMutation({
    mutationFn: () => contestControllers.deleteParticipant(id, participantToDelete?.id as string),
    onSuccess: () => {
      showSnackbar("Participant deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["contest-details", id] });
      queryClient.invalidateQueries({ queryKey: ["participants", id] });
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

  // Fallback: If backend returns all participants instead of paginating, we slice it on the frontend.
  const displayedParticipants = participants.length > rowsPerPage 
    ? participants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : participants;

  const dynamicColumns = useMemo(() => {
    const thumbnailCols: { id: string; label: string }[] = [];
    let nameAdded = false;
    const otherCols: { id: string; label: string }[] = [];

    fields.forEach((field: ContestTemplateField) => {
      const label = field.label?.toLowerCase() || "";
      
      // Skip password fields, radio fields, checkboxes, and dob fields
      if (
        label.includes("password") || 
        field.type === "password" || 
        field.type === "radio" || 
        field.type === "checkbox" || 
        field.type === "boolean" || 
        label === "dob" || 
        label.includes("date of birth") || 
        label.includes("birth") ||
        label.includes("resident") ||
        label.includes("phone") ||
        label.includes("mobile") ||
        label.includes("contact")
      ) {
        return;
      }

      const isFileField = field.type === "file_upload" || field.type === "image" || field.type === "file" || label.includes("avatar") || label.includes("thumbnail") || label.includes("image");
      if (isFileField) {
        thumbnailCols.push({ id: field.id, label: "Thumbnail" });
        return;
      }

      const isNameField = label.includes("first name") || label.includes("last name") || label === "first" || label === "last" || label.includes("name");
      
      if (isNameField) {
        if (!nameAdded) {
          nameAdded = true;
        }
      } else {
        otherCols.push({ id: field.id, label: field.label });
      }
    });

    const cols = [...thumbnailCols];
    cols.push({ id: "composite_name", label: "Name" });
    cols.push(...otherCols);

    return cols;
  }, [fields]);

  const allColumns = useMemo(() => {
    const cols = [
      ...dynamicColumns,
      { id: "status", label: "Status" },
      { id: "joined_at", label: "Joined At" },
    ];
    if (canViewParticipant || canEditParticipant || canDeleteParticipant) {
      cols.push({ id: "actions", label: "Actions" });
    }
    return cols;
  }, [dynamicColumns, canViewParticipant, canEditParticipant, canDeleteParticipant]);

  const seenColumns = React.useRef(new Set<string>());

  useEffect(() => {
    const newCols = allColumns.filter((col) => !seenColumns.current.has(col.id));
    if (newCols.length > 0) {
      newCols.forEach((col) => seenColumns.current.add(col.id));
      setVisibleColumns((prev) => {
        const next = [...prev];
        newCols.forEach((col) => {
          if (!next.includes(col.id)) {
            next.push(col.id);
          }
        });
        return next;
      });
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
        <Table sx={{ mt: 0, minWidth: 800 }} size="small">
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
            {displayedParticipants.map((participant: ContestParticipant) => (
              <TableRow
                key={participant.id}
                sx={{
                  "&:hover": { bgcolor: "rgba(0,0,0,0.01)" },
                  "& .MuiTableCell-root": { borderBottom: `1px solid ${colors.BORDER}`, py: 1 },
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
                      const formData = rawData?.data || rawData || (participant as any).data || (participant as any).participantProfile?.submission?.data?.data || (participant as any).participantProfile?.submission?.data || (participant as any).user?.participantProfile?.submission?.data?.data || (participant as any).user?.participantProfile?.submission?.data || (participant as any).participant_profile_data || {};
                      const firstName = firstNameField ? (formData[firstNameField.label] || formData[firstNameField.id]) : "";
                      const lastName = lastNameField ? (formData[lastNameField.label] || formData[lastNameField.id]) : "";
                      const fullName = fullNameField ? (formData[fullNameField.label] || formData[fullNameField.id]) : "";

                      if (firstName || lastName) {
                        displayValue = `${firstName || ""} ${lastName || ""}`.trim();
                      } else if (fullName) {
                        displayValue = fullName;
                      } else if (formData.yg9snrxlh) {
                        displayValue = formData.yg9snrxlh;
                      } else if (formData.an7ffo0mu) {
                        displayValue = formData.an7ffo0mu;
                      } else if (formData.qlon5xekd) {
                        displayValue = formData.qlon5xekd;
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
                      const formData = rawData?.data || rawData || (participant as any).data || (participant as any).participantProfile?.submission?.data?.data || (participant as any).participantProfile?.submission?.data || (participant as any).user?.participantProfile?.submission?.data?.data || (participant as any).user?.participantProfile?.submission?.data || (participant as any).participant_profile_data || {};
                      let rawValue = formData[col.label] || formData[col.id];
                      
                      if (!rawValue && field) {
                         const labelLower = field.label?.toLowerCase() || col.label?.toLowerCase() || "";
                         if (labelLower.includes("email")) {
                           rawValue = formData.ppdwdyx34 || formData.waqb6gjzw;
                         } else if (labelLower.includes("phone") || labelLower.includes("mobile")) {
                           rawValue = formData.h7695htwx;
                         } else if (labelLower.includes("school") || labelLower.includes("college") || labelLower.includes("institution")) {
                           rawValue = formData['3swf0lufu'];
                         } else if (labelLower.includes("grade") || labelLower.includes("year")) {
                           rawValue = formData.wq5kjwwmo;
                         } else if (labelLower.includes("country")) {
                           rawValue = formData.gjbq1pwch;
                         }
                      }

                      displayValue = rawValue || "—";

                      if (field?.type === "datePicker" && rawValue) {
                        displayValue = moment(rawValue).format("MMM DD, YYYY");
                      }
                      
                      const isFileField = field?.type === "file_upload" || field?.type === "image" || field?.type === "file" || col.label?.toLowerCase().includes("avatar") || col.label?.toLowerCase().includes("thumbnail") || col.label?.toLowerCase().includes("image");
                      
                      if (isFileField) {
                         let downloadUrl = "";
                         const isImageUrl = (url: string) => typeof url === "string" && /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i.test(url.split('?')[0]);
                         
                         const possibleUrl = formData[`${col.id}_downloadUrl`] || formData[`${col.label}_downloadUrl`] || rawValue;
                         if (possibleUrl && isImageUrl(possibleUrl)) {
                           downloadUrl = possibleUrl;
                         }
                         if (!downloadUrl) {
                           const submissionData = participant?.submission?.data?.data || participant?.submission?.data || formData;
                           let downloadUrlKey = Object.keys(submissionData).find((key) => key.endsWith("_downloadUrl") && isImageUrl(submissionData[key]));
                           if (!downloadUrlKey) {
                             downloadUrlKey = Object.keys(submissionData).find((key) => isImageUrl(submissionData[key]));
                           }
                           if (downloadUrlKey) downloadUrl = submissionData[downloadUrlKey];
                         }

                         return (
                           <TableCell key={col.id}>
                             {downloadUrl ? (
                               <Box sx={{ width: 40, height: 40, borderRadius: 1.5, overflow: 'hidden', border: `1px solid ${colors.BORDER}` }}>
                                 <img src={downloadUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                               </Box>
                             ) : (
                               <Avatar 
                                  variant="rounded" 
                                  sx={{ width: 40, height: 40, border: `1px solid ${colors.BORDER}` }} 
                               />
                             )}
                           </TableCell>
                         );
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
                      const formData = rawData?.data || rawData || (participant as any).data || (participant as any).participantProfile?.submission?.data?.data || (participant as any).participantProfile?.submission?.data || (participant as any).participant_profile_data || {};
                      let displayStatus = participant.status || formData.status || "Unknown";
                      if (displayStatus.toLowerCase() === "approved") {
                        displayStatus = "Active";
                      }
                      
                      const getStatusColor = (status: string) => {
                        const lower = status.toLowerCase();
                        if (lower === "draft") return { bg: "#f1f5f9", color: "#475569" };
                        if (lower === "pending") return { bg: "#fef3c7", color: "#b45309" };
                        if (lower === "active" || lower === "approved") return { bg: "#dcfce7", color: "#166534" };
                        if (lower === "banned" || lower === "rejected") return { bg: "#fee2e2", color: "#b91c1c" };
                        return { bg: "#f3f4f6", color: "#374151" };
                      };
                      
                      const statusColors = getStatusColor(displayStatus);
                      
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
                            bgcolor: statusColors.bg,
                            color: statusColors.color,
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
                      {canViewParticipant && (
                        <IconButton
                          size="small"
                          sx={{ color: colors.TEXT_SECONDARY }}
                          onClick={() => router.push(`/contest-management/contests/${contest?.id}/view-user?participantId=${participant.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canEditParticipant && (
                        <IconButton
                          size="small"
                          sx={{ color: colors.TEXT_SECONDARY }}
                          onClick={() => router.push(`/contest-management/contests/${contest?.id}/edit-user?participantId=${participant.id}`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      {canDeleteParticipant && (
                        <IconButton 
                          size="small" 
                          sx={{ color: colors.TEXT_SECONDARY }}
                          onClick={() => {
                            if ((participant as any).entries && (participant as any).entries.length > 0) {
                              showSnackbar("This participant has active entries. Please delete their entries first.", "error");
                              return;
                            }
                            setParticipantToDelete(participant);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {displayedParticipants.length === 0 && (
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
