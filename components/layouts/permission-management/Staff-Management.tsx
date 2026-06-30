"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link,
  Button,
  alpha,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Card,
  TextField,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from "@mui/material";
import {
  ChevronRight,
  Add as Plus,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { useSnackbar } from "@/context/SnackbarContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { roleControllers } from "@/api/roleControllers";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionContext";
import { roboto } from "@/utils/fonts";
import { UserController } from "@/api/userControllers";

const StaffManagement = () => {
  const theme = useTheme();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  
  const canCreateUser = hasPermission("Admin Users", "canCreate");
  const canDeleteUser = hasPermission("Admin Users", "canDelete");
  const canEditUser = hasPermission("Admin Users", "canEdit");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearchTerm]);

  const { data, isPending } = useQuery({
    queryKey: ["admin-users", page, rowsPerPage, debouncedSearchTerm],
    queryFn: () => UserController.getAdminUsers(page + 1, rowsPerPage, debouncedSearchTerm),
  });

  const user_data = data?.data?.data;
  const employees = user_data?.users || [];

  const { data: rolesData, isPending: isRolesPending } = useQuery({
    queryKey: ["roles"],
    queryFn: roleControllers.getAllRoles,
  });

  const availableRoles = rolesData?.data || [];

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await UserController.deleteUserById(userToDelete);
      showSnackbar("Admin user deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || "Failed to delete user", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<ChevronRight sx={{ fontSize: 14, color: alpha(theme.palette.text.secondary, 0.4) }} />}
        sx={{ mb: 3 }}
      >
        <Link underline="hover" color="inherit" href="/dashboard" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
          Dashboard
        </Link>
        <Link underline="hover" color="inherit" href="/permission-management/employees" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
          Admin Users
        </Link>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: colors.TEXT_PRIMARY,
              mb: 1,
            }}
          >
            Admin Users
          </Typography>
          <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}>
            Manage admin users and assign them system roles.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {canCreateUser && (
            <Button
              variant="contained"
              onClick={() => router.push("/permission-management/employees/add")}
              startIcon={<Plus sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Add Admin User
            </Button>
          )}
        </Stack>
      </Box>

      {/* Employees Table */}
      <Card
        sx={{
          boxShadow: "0px 0px 1px 1px #eee",
          mt: 2,
          border: "1px solid #eeeeee",
          py: 2,
        }}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          spacing={3}
          sx={{ mb: 3, px: 2 }}
        >
          <TextField 
            placeholder="Search by name or email..." 
            fullWidth 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Stack>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
                <TableCell sx={{ color: colors.TEXT_PRIMARY, fontFamily: roboto.style.fontFamily, fontWeight: 700, fontSize: "0.8rem", borderBottom: `1px solid ${colors.BORDER}`, py: 2 }}>User</TableCell>
                <TableCell sx={{ color: colors.TEXT_PRIMARY, fontFamily: roboto.style.fontFamily, fontWeight: 700, fontSize: "0.8rem", borderBottom: `1px solid ${colors.BORDER}`, py: 2 }}>Role Assigned</TableCell>
                <TableCell sx={{ color: colors.TEXT_PRIMARY, fontFamily: roboto.style.fontFamily, fontWeight: 700, fontSize: "0.8rem", borderBottom: `1px solid ${colors.BORDER}`, py: 2 }}>Status</TableCell>
                <TableCell align="right" sx={{ color: colors.TEXT_PRIMARY, fontFamily: roboto.style.fontFamily, fontWeight: 700, fontSize: "0.8rem", borderBottom: `1px solid ${colors.BORDER}`, py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isPending && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Loading admin users...</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isPending && employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                    <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
                      No admin users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isPending && employees.map((emp: any) => (
                <TableRow key={emp.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1, borderRadius: "50%", bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }}>
                        <PersonIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY, fontFamily: roboto.style.fontFamily }}>
                          {emp.fullName || "—"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, fontFamily: roboto.style.fontFamily }}>
                          {emp.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={emp.roleEntity?.name || emp.role || "No Role"} 
                      size="small"
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: "0.7rem", 
                        fontFamily: roboto.style.fontFamily,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: "secondary.main",
                        borderRadius: "6px"
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        fontFamily: roboto.style.fontFamily,
                        width: "fit-content",
                        py: 0.5,
                        px: 1.5,
                        borderRadius: "6px",
                        bgcolor: emp.status === "Active" ? "#dcfce7" : "#f3f4f6",
                        color: emp.status === "Active" ? "#166534" : "#374151",
                      }}
                    >
                      {emp.status || "Pending"}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {canEditUser && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => router.push(`/permission-management/employees/edit/${emp.id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canDeleteUser && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(emp.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={user_data?.total || 0}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => { if (!isDeleting) setDeleteDialogOpen(false); }}>
        <DialogTitle sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 700 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: roboto.style.fontFamily }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" disabled={isDeleting} sx={{ textTransform: 'none', fontFamily: roboto.style.fontFamily }}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={isDeleting} sx={{ textTransform: 'none', fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
