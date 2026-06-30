"use client";

import { entryControllers } from "@/api/entryControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { useContestDetails } from "@/store/useContestDetails";
import { ContestEntry } from "@/types/user";
import { roboto } from "@/utils/fonts";
import { Delete, Edit, RemoveRedEye } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePermissions } from "@/context/PermissionContext";

const EntryStatusDropdown = ({ entry, contestId }: { entry: any; contestId: string }) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const hasScore = entry.score !== undefined && entry.score !== null && entry.score > 0;
  const isEvaluatedBackend = entry.status?.toLowerCase() === "evaluated" || hasScore;
  
  const getInitialStatus = () => {
    const s = entry.status?.toLowerCase() || "pending";
    if (s === "pending" || s === "approved") {
      if (hasScore) return "evaluated";
    }
    return s;
  };

  const [currentStatus, setCurrentStatus] = useState<string>(getInitialStatus());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setCurrentStatus(getInitialStatus());
  }, [entry.status, entry.score]);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: { status: string; reason?: string }) => 
      entryControllers.updateEntryStatus(contestId, { entryIds: [entry.id], status: data.status, reason: data.reason }),
    onSuccess: (_, variables) => {
      setCurrentStatus(variables.status);
      showSnackbar("Status updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["entries", contestId] });
    },
    onError: (error: any) => {
      console.error(error);
      showSnackbar(error?.response?.data?.message || "Failed to update status", "error");
      setCurrentStatus(entry.status || "pending");
    },
  });

  const isInteractive = currentStatus.toLowerCase() !== "draft" && currentStatus.toLowerCase() !== "rejected";

  const handleChipClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractive && !mutation.isPending) {
      setAnchorEl(event.currentTarget as unknown as HTMLElement);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusSelect = (newStatus: string) => {
    handleMenuClose();
    if (newStatus !== currentStatus) {
      if (newStatus === "rejected") {
        setRejectDialogOpen(true);
      } else {
        setPendingStatus(newStatus);
        setConfirmDialogOpen(true);
      }
    }
  };

  const handleStatusConfirm = () => {
    if (pendingStatus) {
      mutation.mutate({ status: pendingStatus });
    }
    setConfirmDialogOpen(false);
    setPendingStatus(null);
  };

  const handleRejectConfirm = () => {
    mutation.mutate({ status: "rejected", reason: rejectReason });
    setRejectDialogOpen(false);
    setRejectReason("");
  };

  const getDisplayStatus = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "approved") return "Moderate";
    if (lower === "evaluated") return "Evaluated";
    return status;
  };

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

  const colors = getStatusColor(currentStatus);

  return (
    <>
      <Chip
        label={getDisplayStatus(currentStatus)}
        size="small"
        onClick={isInteractive ? handleChipClick : undefined}
        onDelete={mutation.isPending ? () => {} : undefined}
        deleteIcon={mutation.isPending ? <CircularProgress size={12} sx={{ color: colors.text }} /> : undefined}
        sx={{
          bgcolor: colors.bg,
          color: colors.text,
          fontWeight: 700,
          borderRadius: "6px",
          fontSize: "0.75rem",
          textTransform: "capitalize",
          height: 24,
          cursor: isInteractive ? "pointer" : "default",
          border: 'none',
          "&:hover": {
            bgcolor: isInteractive ? `${colors.bg}dd` : colors.bg,
          },
          "& .MuiChip-label": {
            px: 1.5,
          }
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: 2,
            minWidth: 120,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        {!isEvaluatedBackend && (
          <MenuItem onClick={() => handleStatusSelect("pending")} sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
            Pending
          </MenuItem>
        )}
        {!isEvaluatedBackend && (
          <MenuItem onClick={() => handleStatusSelect("approved")} sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
            Moderate
          </MenuItem>
        )}
        {!isEvaluatedBackend && (
          <MenuItem onClick={() => handleStatusSelect("rejected")} sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
            Rejected
          </MenuItem>
        )}
        
        {isEvaluatedBackend && (
          <MenuItem onClick={() => handleStatusSelect("evaluated")} sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
            Evaluated
          </MenuItem>
        )}
        {isEvaluatedBackend && (
          <MenuItem onClick={() => handleStatusSelect("semifinal")} sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
            Semifinal
          </MenuItem>
        )}
        {isEvaluatedBackend && (
          <MenuItem onClick={() => handleStatusSelect("final")} sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
            Final
          </MenuItem>
        )}
        {isEvaluatedBackend && (
          <MenuItem onClick={() => handleStatusSelect("winner")} sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
            Winner
          </MenuItem>
        )}
        {isEvaluatedBackend && (
          <MenuItem onClick={() => handleStatusSelect("rejected")} sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
            Rejected
          </MenuItem>
        )}
      </Menu>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reason for Rejection</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this entry. This will be visible to the participant.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Enter reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleRejectConfirm} variant="contained" color="error" disabled={!rejectReason.trim() || mutation.isPending}>
            {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to change the status of this entry to <strong>{pendingStatus ? getDisplayStatus(pendingStatus) : ""}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleStatusConfirm} variant="contained" color="primary" disabled={mutation.isPending}>
            {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const EntriesList = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ContestEntry | null>(null);

  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string;
  const { contest } = useContestDetails();

  const { hasPermission } = usePermissions();
  const canViewEntry = hasPermission("Contests", "canView");
  const canEditEntry = hasPermission("Contests", "canEdit");
  const canDeleteEntry = hasPermission("Contests", "canDelete");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");

  const handleStatusChange = (event: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue);
    setPage(0);
  };

  const { data: entriesData, isPending } = useQuery({
    queryKey: ["entries", id, page, rowsPerPage, statusFilter],
    queryFn: () => entryControllers.getAllEntries(id, page + 1, rowsPerPage, statusFilter),
    enabled: !!id,
  });

  const deleteEntryMutation = useMutation({
    mutationFn: () => entryControllers.deleteEntry(id, entryToDelete?.id as string),
    onSuccess: () => {
      showSnackbar("Entry deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["entries", id] });
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    },
    onError: (error: unknown) => {
      console.error(error);
      const err = error as any;
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to delete entry";
      showSnackbar(errorMessage, "error");
    },
  });

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const userFields = (contest as any)?.userLevelTemplate?.schema?.fields || (contest as any)?.user_level_template?.schema?.fields || [];
  const nameField = userFields.find((f: any) => f.label?.toLowerCase().includes("name")) || userFields[0];
  const participantNameId = nameField?.id;

  const entryFields = (contest as any)?.entryLevelTemplate?.schema?.fields || (contest as any)?.entry_level_template?.schema?.fields || [];
  const titleField = entryFields.find((f: any) => f.label?.toLowerCase().includes("title") || f.label?.toLowerCase().includes("name")) || entryFields[0];
  const entryTitleId = titleField?.id;

  // Safely extract entries array from API response (paginated: { docs: [...] })
  const rawData = entriesData?.data;
  const entries: ContestEntry[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.docs)
      ? rawData.docs
      : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData?.entries)
          ? rawData.entries
          : [];
  
  const total = rawData?.totalDocs || rawData?.total || rawData?.meta?.total || entries.length;

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={statusFilter}
          onChange={handleStatusChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="All" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Pending" value="Pending" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Moderate" value="Approved" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Evaluated" value="Evaluated" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Semifinal" value="Semifinal" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Final" value="Final" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Winner" value="Winner" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Rejected" value="Rejected" sx={{ fontWeight: 600, textTransform: 'none' }} />
        </Tabs>
      </Box>
      <Table sx={{ mt: 2 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
                Thumbnail
              </Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
                Title
              </Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
                Author
              </Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
                Score
              </Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
                Status
              </Typography>
            </TableCell>
            {(canViewEntry || canEditEntry || canDeleteEntry) && (
              <TableCell align="right">
                <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
                  Actions
                </Typography>
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography sx={{ py: 4, fontFamily: roboto.style.fontFamily, color: "text.secondary" }}>
                  No entries found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : entries.map((entry: ContestEntry, index: number) => {
            const entryTitleField = entryFields?.find((f: any) => {
              const l = f.label?.toLowerCase() || "";
              return l.includes("title") || l.includes("project");
            });
            const sData = entry?.submission?.data || {};
            let entryTitle = "";
            if (entryTitleField && sData) {
              entryTitle = sData[entryTitleField.label] || sData[entryTitleField.id];
            }
            if (!entryTitle) {
              entryTitle = sData?.name_1 || sData?.ho1p00z0q || sData?.["Innovation Title"] || sData?.zvdskzwrw;
            }
            if (!entryTitle) {
              const values = Object.entries(sData)
                .filter(([k, v]: [string, any]) => !["status", "isdraft"].includes(k.toLowerCase()) && typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v))
                .map(([k, v]) => v);
              if (values.length > 0) entryTitle = values[0] as string;
            }
            const firstNameField = userFields.find((f: any) => {
              const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
              return l.includes("firstname") || l === "first";
            });
            const lastNameField = userFields.find((f: any) => {
              const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
              return l.includes("lastname") || l === "last";
            });
            const fullNameField = userFields.find((f: any) => {
              const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
              return l.includes("fullname") || l === "name" || (l.includes("name") && !l.includes("first") && !l.includes("last"));
            });

            const rawAuthorData = entry?.participant?.submission?.data;
            const authorData = rawAuthorData?.data || rawAuthorData || (entry?.participant as any)?.data || (entry?.participant as any)?.participant_profile_data || {};
            let authorName = "";

            if (firstNameField || lastNameField) {
              const first = firstNameField ? (authorData[firstNameField.label] || authorData[firstNameField.id]) : "";
              const last = lastNameField ? (authorData[lastNameField.label] || authorData[lastNameField.id]) : "";
              authorName = `${first || ""} ${last || ""}`.trim();
            }
            
            if (!authorName && fullNameField && authorData && Object.keys(authorData).length > 0) {
              authorName = authorData[fullNameField.label] || authorData[fullNameField.id];
            }

            if (!authorName && authorData && Object.keys(authorData).length > 0) {
              const fallback = userFields.find((f: any) => f.label?.toLowerCase().includes("name"));
              if (fallback && (authorData[fallback.label] || authorData[fallback.id])) {
                authorName = authorData[fallback.label] || authorData[fallback.id];
              } else {
                authorName = authorData.yg9snrxlh || authorData.an7ffo0mu || authorData.qlon5xekd;
              }
            }

            // FALLBACK: If no author name yet, check entry submission data itself!
            if (!authorName && sData) {
              const allFields = [...userFields, ...entryFields];
              const fNameField = allFields.find((f: any) => {
                const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
                return l.includes("firstname") || l === "first";
              });
              const lNameField = allFields.find((f: any) => {
                const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
                return l.includes("lastname") || l === "last";
              });
              
              if (fNameField || lNameField) {
                const first = fNameField ? (sData[fNameField.label] || sData[fNameField.id]) : "";
                const last = lNameField ? (sData[lNameField.label] || sData[lNameField.id]) : "";
                authorName = `${first || ""} ${last || ""}`.trim();
              }
              
              if (!authorName) {
                 authorName = sData.yg9snrxlh || sData.an7ffo0mu || sData.qlon5xekd || sData.os28hf1aa;
                 if (authorName && sData.tlb9rveot) authorName += " " + sData.tlb9rveot;
              }
            }
            
            if (!authorName && authorData && Object.keys(authorData).length > 0) {
              const values = Object.entries(authorData)
                .filter(([k, v]: [string, any]) => !["status", "isdraft"].includes(k.toLowerCase()) && typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v))
                .map(([k, v]) => v);
              if (values.length > 0) authorName = values[0] as string;
            }// Extract thumbnail from submission data
            const submissionData = entry?.submission?.data || {};
            
            const thumbnailField = entryFields?.find((f: any) => f.label?.toLowerCase().includes("thumbnail"));
            let thumbnailUrl = "";
            if (thumbnailField) {
              thumbnailUrl = submissionData[`${thumbnailField.id}_downloadUrl`] || submissionData[`${thumbnailField.label}_downloadUrl`] || submissionData[thumbnailField.id] || submissionData[thumbnailField.label] || "";
            }
            
            if (!thumbnailUrl) {
              const downloadUrlKey = Object.keys(submissionData).find((key) => key.endsWith("_downloadUrl"));
              thumbnailUrl = downloadUrlKey ? submissionData[downloadUrlKey] : "";
            }
            
            // Fallback: find the base image URL field (without _downloadUrl suffix)
            if (!thumbnailUrl) {
              const imageUrlKey = Object.keys(submissionData).find((key) => {
                if (key === "status" || key.endsWith("_downloadUrl")) return false;
                const val = submissionData[key];
                return typeof val === "string" && /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(val);
              });
              if (imageUrlKey) thumbnailUrl = submissionData[imageUrlKey];
            }

            return (
              <TableRow key={index}>
                <TableCell>
                  <Avatar
                    variant="rounded"
                    src={thumbnailUrl}
                    onClick={() =>
                      router.push(
                        `/contest-management/entries/${entry.id}?contestId=${entry.contest_id}`
                      )
                    }
                    sx={{
                      width: 50,
                      height: 30,
                      cursor: "pointer",
                      "&:hover": { opacity: 0.8, transform: "scale(1.1)" },
                      transition: "all 0.2s ease",
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography
                    onClick={() =>
                      router.push(
                        `/contest-management/entries/${entry.id}?contestId=${entry.contest_id}`
                      )
                    }
                    sx={{
                      fontFamily: roboto.style.fontFamily,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      "&:hover": { color: "primary.main", textDecoration: "underline" },
                      transition: "color 0.2s ease",
                    }}
                  >
                    {entryTitle || "Untitled"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>
                    {authorName || "Unknown"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>
                    {entry.score !== undefined && entry.score !== null ? entry.score : 0}
                  </Typography>
                </TableCell>

                <TableCell>
                  <EntryStatusDropdown entry={entry} contestId={id} />
                </TableCell>

                {(canViewEntry || canEditEntry || canDeleteEntry) && (
                  <TableCell align="right">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                      {canViewEntry && (
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() =>
                            router.push(
                              `/contest-management/entries/${entry.id}?contestId=${entry.contest_id}`
                            )
                          }
                        >
                          <RemoveRedEye fontSize="small" />
                        </IconButton>
                      )}

                      {canEditEntry && (
                        <IconButton
                          size="small"
                          sx={{ color: "#8b5cf6" }}
                          onClick={() =>
                            router.push(
                              `/contest-management/contests/${entry?.contest_id}/entries/edit-entry?entryId=${entry.id}`
                            )
                          }
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}

                      {canDeleteEntry && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setEntryToDelete(entry);
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
            );
          })}
        </TableBody>
      </Table>
      
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.25rem" }}>
          Delete Entry
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete the entry{" "}
            <strong>
              {entryToDelete?.submission?.data?.["Innovation Title"] || entryToDelete?.submission?.data?.ho1p00z0q || "Untitled"}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              borderColor: "divider",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => deleteEntryMutation.mutate()}
            variant="contained"
            color="error"
            disabled={deleteEntryMutation.isPending}
            sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none" }}
          >
            {deleteEntryMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntriesList;