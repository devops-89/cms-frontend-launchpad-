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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const EntryStatusDropdown = ({ entry, contestId }: { entry: any; contestId: string }) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [currentStatus, setCurrentStatus] = useState<string>(entry.status || "pending");

  useEffect(() => {
    setCurrentStatus(entry.status || "pending");
  }, [entry.status]);

  const mutation = useMutation({
    mutationFn: (newStatus: string) => entryControllers.updateEntrySubmission(contestId, entry.id, { status: newStatus }),
    onSuccess: (_, newStatus) => {
      setCurrentStatus(newStatus);
      showSnackbar("Status updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["entries", contestId] });
    },
    onError: (error: any) => {
      console.error(error);
      showSnackbar(error?.response?.data?.message || "Failed to update status", "error");
      setCurrentStatus(entry.status || "pending");
    },
  });

  const handleStatusChange = (e: any) => {
    const newStatus = e.target.value;
    if (newStatus !== currentStatus) {
      mutation.mutate(newStatus);
    }
  };

  const getDisplayStatus = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "approved") return "Moderate";
    if (lower === "evaluated") return "Evaluated";
    return status;
  };

  const getStatusColor = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "approved") return { bg: "#dcfce7", text: "#166534" };
    if (lower === "evaluated") return { bg: "#e0e7ff", text: "#3730a3" };
    if (lower === "pending") return { bg: "#fef08a", text: "#854d0e" };
    return { bg: "#f3f4f6", text: "#374151" };
  };

  const colors = getStatusColor(currentStatus);

  if (currentStatus.toLowerCase() === "evaluated") {
    return (
      <Box
        sx={{
          display: "inline-block",
          px: 1.5,
          py: 0.5,
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "capitalize",
          bgcolor: colors.bg,
          color: colors.text,
        }}
      >
        {getDisplayStatus(currentStatus)}
      </Box>
    );
  }

  return (
    <FormControl variant="standard" fullWidth>
      <Select
        value={currentStatus}
        onChange={handleStatusChange}
        disableUnderline
        disabled={mutation.isPending}
        IconComponent={
          mutation.isPending
            ? () => <CircularProgress size={14} sx={{ mr: 1, ml: 0.5, color: colors.text }} />
            : undefined
        }
        sx={{
          fontSize: "0.75rem",
          fontWeight: 700,
          width: "fit-content",
          "& .MuiSelect-select": {
            py: 0.5,
            px: 1,
            borderRadius: "6px",
            bgcolor: colors.bg,
            color: colors.text,
            display: "flex",
            alignItems: "center",
            textTransform: "capitalize",
          },
          "& .MuiSvgIcon-root": {
            color: colors.text,
          },
        }}
      >
        <MenuItem value="pending" sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>Pending</MenuItem>
        <MenuItem value="approved" sx={{ fontSize: "0.85rem", textTransform: "capitalize" }}>Moderate</MenuItem>
      </Select>
    </FormControl>
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
  
  const { data: entriesData, isPending } = useQuery({
    queryKey: ["entries", id],
    queryFn: () => entryControllers.getAllEntries(id),
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

  return (
    <Box>
      <Table sx={{ mt: 2 }}>
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
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {entriesData?.data?.map((entry: ContestEntry, index: number) => {
            const entryTitleField = entryFields?.find((f: any) => {
              const l = f.label?.toLowerCase() || "";
              return l.includes("title") || l.includes("project");
            });
            const entryTitle = entryTitleField ? (entry?.submission?.data?.[entryTitleField.label] || entry?.submission?.data?.[entryTitleField.id]) : (entry?.submission?.data?.ho1p00z0q || entry?.submission?.data?.["Innovation Title"]);
            
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
            
            if (!authorName && fullNameField) {
              authorName = authorData[fullNameField.label] || authorData[fullNameField.id];
            }

            if (!authorName) {
              const fallback = userFields.find((f: any) => f.label?.toLowerCase().includes("name"));
              if (fallback && (authorData[fallback.label] || authorData[fallback.id])) {
                authorName = authorData[fallback.label] || authorData[fallback.id];
              } else {
                authorName = authorData.yg9snrxlh;
              }
            }
            return (
              <TableRow key={index}>
                <TableCell>
                  <Avatar
                    variant="rounded"
                    src=""
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
                    {entry.score}
                  </Typography>
                </TableCell>

                <TableCell>
                  <EntryStatusDropdown entry={entry} contestId={id} />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

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