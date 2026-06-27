"use client";
import { contestControllers } from "@/api/contestControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import {
  CONTEST_TABLE_HEADER,
  CONTEST_TABLE_STATUS,
} from "@/utils/constant";
import { UserStatus } from "@/utils/enum";
import { roboto } from "@/utils/fonts";
import { Delete, Edit, RemoveRedEye } from "@mui/icons-material";
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ContestTable = () => {
  const theme = useTheme();
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contestToDelete, setContestToDelete] = useState<any>(null);

  const tabChangeHandler = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const currentStatus = CONTEST_TABLE_STATUS[value]?.label || "All";

  const { data, isPending, error } = useQuery({
    queryKey: ["contests", page, limit, searchQuery, currentStatus],
    queryFn: () => contestControllers.getContest(page + 1, limit, searchQuery, currentStatus),
    enabled: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contestControllers.deleteContest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      showSnackbar("Contest deleted successfully", "success");
      setDeleteDialogOpen(false);
      setContestToDelete(null);
    },
    onError: (err: any) => {
      showSnackbar(
        err?.response?.data?.message || "Failed to delete contest",
        "error",
      );
    },
  });



  const contestsList = Array.isArray(data?.data?.docs) ? data.data.docs : [];

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.PUBLISHED:
        return "success";
      case UserStatus.OFFLINE:
        return "error";
      case UserStatus.DRAFT:
        return "warning";
      default:
        return "default";
    }
  };

  // console.log("test", data);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={tabChangeHandler}>
          {CONTEST_TABLE_STATUS.map((item, index) => (
            <Tab key={index} label={item.label} sx={{ textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
        <TextField
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          sx={{
            fontFamily: roboto.style.fontFamily,
            width: "300px",
            mr: 1
          }}
        />
      </Box>
      <Table sx={{ mt: 2 }} size="small">
        <TableHead>
          <TableRow>
            {CONTEST_TABLE_HEADER.map((item, index) => (
              <TableCell key={index}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: roboto.style.fontFamily,
                  }}
                >
                  {item}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={CONTEST_TABLE_HEADER.length} align="center">
                <Typography sx={{ py: 4 }}>Loading contests...</Typography>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={CONTEST_TABLE_HEADER.length} align="center">
                <Typography color="error" sx={{ py: 4 }}>
                  Error loading contests.
                </Typography>
              </TableCell>
            </TableRow>
          ) : contestsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={CONTEST_TABLE_HEADER.length} align="center">
                <Typography sx={{ py: 4 }}>No contests found.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            contestsList.map((item: any, index: number) => (
              <TableRow key={item.id || index}>
                <TableCell>
                  <Typography
                    onClick={() =>
                      router.push(`/contest-management/contests/${item.id}`)
                    }
                    sx={{
                      fontWeight: 500,
                      fontFamily: roboto.style.fontFamily,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: "primary.main",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {item.name}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {moment(item.start_date).format("YYYY-MM-DD")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {moment(item.end_date).format("YYYY-MM-DD")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontSize: 12,
                      fontWeight: 600,
                      minWidth: 90,
                      textTransform: "capitalize",
                      bgcolor: alpha(
                        theme.palette[
                          getStatusColor(
                            (item.status || UserStatus.DRAFT) as UserStatus,
                          ) as "success" | "warning" | "error" | "info"
                        ]?.main || theme.palette.grey[400],
                        0.1,
                      ),
                      color:
                        theme.palette[
                          getStatusColor(
                            (item.status || UserStatus.DRAFT) as UserStatus,
                          ) as "success" | "warning" | "error" | "info"
                        ]?.main || theme.palette.grey[700],
                    }}
                  >
                    {item.status || UserStatus.DRAFT}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {item.entryCount ?? "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() =>
                        router.push(`/contest-management/contests/${item.id}`)
                      }
                    >
                      <RemoveRedEye fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() =>
                        router.push(
                          `/contest-management/contests/${item.id}/edit`,
                        )
                      }
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        setContestToDelete(item);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        component="div"
        count={data?.data?.totalDocs || data?.data?.total || contestsList.length || 0}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => {
          setLimit(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

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
            Are you sure you want to delete this contest? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => deleteMutation.mutate(contestToDelete?.id)}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending && <CircularProgress size={16} color="inherit" />}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContestTable;
