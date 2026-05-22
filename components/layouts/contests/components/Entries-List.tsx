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
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {entriesData?.data?.map((entry: ContestEntry, index: number) => {
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
                    {entry?.submission?.data?.ho1p00z0q || "Untitled"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>
                    {entry?.participant?.submission?.data?.yg9snrxlh || "Unknown"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>
                    {entry.score}
                  </Typography>
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
              {entryToDelete?.submission?.data?.ho1p00z0q || "Untitled"}
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