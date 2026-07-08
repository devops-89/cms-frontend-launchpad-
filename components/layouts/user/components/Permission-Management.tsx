import { permissionControllers } from "@/api/permissionControllers";
import { roleControllers } from "@/api/roleControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";
import {
  Edit as Edit2,
  Visibility as Eye,
  Info,
  Lock,
  Add as Plus,
  Refresh as RefreshCcw,
  Save,
  Security as ShieldCheck,
  Delete as Trash2
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { handleStrictInputChange } from "@/utils/inputValidations";

interface ModulePermission {
  id?: number;
  module: string;
  read: boolean;
  write: boolean;
}

interface RolePermissions {
  role: string;
  roleId?: string;
  userCount?: number;
  permissions: ModulePermission[];
}

const INITIAL_DATA: RolePermissions[] = [
  {
    role: "Super Admin",
    permissions: [
      { module: "User Management", read: true, write: true },
      { module: "Contest Management", read: true, write: true },
      { module: "Form Builder", read: true, write: true },
    ],
  },
  {
    role: "Admin",
    permissions: [
      { module: "User Management", read: true, write: true },
      { module: "Contest Management", read: true, write: true },
      { module: "Form Builder", read: true, write: true },
    ],
  },
  {
    role: "Judge",
    permissions: [
      { module: "User Management", read: false, write: false },
      { module: "Contest Management", read: true, write: true },
      { module: "Form Builder", read: false, write: false },
    ],
  },
];

const PermissionManagement: React.FC = () => {
  const theme = useTheme();
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState<RolePermissions[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: rolesData, isPending: isRolesPending } = useQuery({
    queryKey: ["roles"],
    queryFn: roleControllers.getAllRoles,
  });

  const { data: permissionsData, isPending: isPermissionsPending } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionControllers.getAllPermissions,
  });

  const isPending = isRolesPending || isPermissionsPending;

  // Initial load to build the sidebar roles and populate data
  useEffect(() => {
    if (permissionsData?.data || rolesData?.data) {
      const backendPermissions = permissionsData?.data || [];
      const backendRoles = rolesData?.data || [];
      
      // Extract unique roles from both APIs
      const uniqueRolesMap = new Map();
      
      // 1. First add roles from the roles API (these include newly created ones without permissions)
      backendRoles.forEach((r: any) => {
        if (r.name && !uniqueRolesMap.has(r.name)) {
          uniqueRolesMap.set(r.name, {
            name: r.name,
            roleId: r.id || null
          });
        }
      });

      // 2. Then add roles from permissions API (these include static string roles like SUPER_ADMIN)
      backendPermissions.forEach((p: any) => {
        const roleName = p.roleEntity?.name || p.role;
        if (roleName && !uniqueRolesMap.has(roleName)) {
          uniqueRolesMap.set(roleName, {
            name: roleName,
            roleId: p.role_id || p.roleId || null
          });
        }
      });
      
      // The typed role shouldn't be added preemptively

      const extractedRoles = Array.from(uniqueRolesMap.values());
      
      const mergedData = extractedRoles.map((br: any) => {
        // Find permissions for this specific role
        const rolePerms = backendPermissions.filter((p: any) => {
          const pRoleName = p.roleEntity?.name || p.role;
          return pRoleName?.toLowerCase() === br.name?.toLowerCase();
        });
        
        let userCount = 0;
        if (rolePerms.length > 0) {
          userCount = rolePerms[0].userCount || 0;
        }
        
        const defaultModules = [
          "Country Management",
          "Users",
          "Public",
          "Judges",
          "Contests",
          "Form Builder"
        ];

        return {
          role: br.name,
          roleId: br.roleId,
          userCount: userCount,
          permissions: defaultModules.map(moduleName => {
            const existingPerm = rolePerms.find((p: any) => p.module === moduleName);
            if (existingPerm) {
              return {
                id: existingPerm.id,
                module: moduleName,
                read: existingPerm.canRead || existingPerm.canView || false,
                write: existingPerm.canWrite || existingPerm.canCreate || existingPerm.canEdit || false,
              };
            }
            return {
              module: moduleName,
              read: false,
              write: false,
            };
          })
        };
      });
      setData(mergedData);
      
      // Update selected role if not set or if current one doesn't exist anymore
      if (!selectedRole || !mergedData.find((r: any) => r.role === selectedRole)) {
        if (mergedData.length > 0) {
          setSelectedRole(mergedData[0].role);
        } else {
          setSelectedRole("");
        }
      }
    }
  }, [permissionsData, rolesData]);

  const createRoleMutation = useMutation({
    mutationFn: roleControllers.createRole,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      showSnackbar("Role Created Successfully.", "success");
      const newRoleNameResponse = response?.data?.name || newRoleName;
      setSelectedRole(newRoleNameResponse);
      setNewRoleName("");
      setIsAddRoleModalOpen(false);
    },
    onError: (error: any) => {
      showSnackbar(error?.response?.data?.message || "Failed to create role", "error");
    },
  });

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    
    // Check if role already exists in frontend list
    if (data.some(r => r.role.toLowerCase() === newRoleName.toLowerCase())) {
      showSnackbar("Role already exists", "error");
      return;
    }

    createRoleMutation.mutate({ name: newRoleName });
  };

  const deleteRoleMutation = useMutation({
    mutationFn: roleControllers.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      showSnackbar("Role and its associated permissions soft deleted successfully.", "success");
      setIsDeleteDialogOpen(false);
      if (selectedRole === roleToDelete?.role) {
        setSelectedRole("");
      }
    },
    onError: (error: any) => {
      showSnackbar(error?.response?.data?.message || "Failed to delete role", "error");
    },
  });

  const savePermissionsMutation = useMutation({
    mutationFn: async (changedModules: any[]) => {
      const currentRole = data.find(r => r.role === selectedRole);
      if (!currentRole) return;
      
      const newModules = changedModules.filter((m: any) => !m.id);
      const existingModules = changedModules.filter((m: any) => m.id);
      
      const promises: Promise<any>[] = [];

      // Handle new permissions (POST / Bulk POST)
      if (newModules.length > 1) {
        const bulkPayload = newModules.map((perm: any) => ({
          role: selectedRole,
          roleId: currentRole.roleId,
          module: perm.module,
          canRead: perm.read,
          canWrite: perm.write,
          canView: perm.read,
          canCreate: perm.write,
          canEdit: perm.write,
          canDelete: perm.write
        }));
        promises.push(permissionControllers.createBulkPermissions(bulkPayload));
      } else if (newModules.length === 1) {
        const perm = newModules[0];
        promises.push(permissionControllers.createPermission({
          role: selectedRole,
          roleId: currentRole.roleId,
          module: perm.module,
          canRead: perm.read,
          canWrite: perm.write,
          canView: perm.read,
          canCreate: perm.write,
          canEdit: perm.write,
          canDelete: perm.write
        }));
      }

      // Handle updates using Bulk PUT
      if (existingModules.length > 0) {
        const bulkUpdatePayload = existingModules.map((perm: any) => ({
          id: perm.id,
          role: selectedRole,
          roleId: currentRole.roleId,
          module: perm.module,
          canRead: perm.read,
          canWrite: perm.write,
          canView: perm.read,
          canCreate: perm.write,
          canEdit: perm.write,
          canDelete: perm.write
        }));
        promises.push(permissionControllers.updateBulkPermissions(bulkUpdatePayload));
      }

      await Promise.all(promises);
      
      if (existingModules.length > 0 && newModules.length === 0) {
        return "Permissions updated successfully.";
      } else if (newModules.length > 0 && existingModules.length === 0) {
        return "Permissions created successfully.";
      }
      return "Permissions saved successfully.";
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      showSnackbar(message || "Permissions saved successfully.", "success");
    },
    onError: (error: any) => {
      showSnackbar(error?.response?.data?.message || "Failed to save permissions", "error");
    },
  });

  const handleSavePermissions = () => {
    const currentRole = data.find(r => r.role === selectedRole);
    if (!currentRole) return;

    // Get original permissions from backend data to compare
    const originalRolePerms = permissionsData?.data?.filter((p: any) => {
      const pRoleName = p.roleEntity?.name || p.role;
      return pRoleName?.toLowerCase() === selectedRole.toLowerCase();
    }) || [];

    // Filter to only modules that actually changed
    const changedModules = currentRole.permissions.filter(perm => {
      const original = originalRolePerms.find((p: any) => p.module === perm.module);
      if (original) {
        const origRead = original.canRead || original.canView || false;
        const origWrite = original.canWrite || original.canCreate || original.canEdit || false;
        return perm.read !== origRead || perm.write !== origWrite;
      } else {
        // If it didn't exist before, it's only a change if read or write were toggled to true
        return perm.read || perm.write;
      }
    });

    if (changedModules.length === 0) {
      showSnackbar("No changes detected.", "info");
      return;
    }

    savePermissionsMutation.mutate(changedModules);
  };

  const togglePermission = (roleName: string, moduleName: string, field: keyof Omit<ModulePermission, "module">) => {
    setData((prev) =>
      prev.map((r) => {
        if (r.role === roleName) {
          return {
            ...r,
            permissions: r.permissions.map((p) => {
              if (p.module === moduleName) {
                return { ...p, [field]: !p[field] };
              }
              return p;
            }),
          };
        }
        return r;
      })
    );
  };

  const currentRoleData = data.find((r) => r.role === selectedRole);

  const getPermissionIcon = (type: string) => {
    const iconSx = { fontSize: 16 };
    switch (type) {
      case "read": return <Eye sx={iconSx} />;
      case "write": return <Edit2 sx={iconSx} />;
      default: return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Breadcrumb
          title="Permission Management"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Permission Management", href: "#" },
          ]}
        />
      </Box>

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
            System Permissions
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshCcw sx={{ fontSize: 18 }} />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ["roles"] })}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePermissions}
            disabled={savePermissionsMutation.isPending || !selectedRole}
            startIcon={<Save sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {savePermissionsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Role Selector Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="overline" sx={{ fontWeight: 900, color: "text.primary", letterSpacing: 1.5 }}>
              User Roles
            </Typography>
            <Tooltip title="Create New Role">
              <IconButton 
                size="small" 
                onClick={() => setIsAddRoleModalOpen(true)}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: "primary.main",
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Plus sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Stack spacing={1}>
            {isPending && data.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", py: 2 }}>Loading roles...</Typography>
            ) : data.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", py: 2 }}>No roles found.</Typography>
            ) : null}
            {data.map((role) => (
              <Paper
                key={role.role}
                onClick={() => setSelectedRole(role.role)}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: selectedRole === role.role ? theme.palette.primary.main : alpha(theme.palette.divider, 0.08),
                  bgcolor: selectedRole === role.role ? alpha(theme.palette.primary.main, 0.04) : "background.paper",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateX(4px)",
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography sx={{ fontWeight: 700, color: selectedRole === role.role ? "primary.main" : "text.primary" }}>
                    {role.role}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {selectedRole === role.role ? <ShieldCheck sx={{ fontSize: 20 }} color="primary" /> : <Lock sx={{ fontSize: 16, opacity: 0.3 }} />}
                    {role.roleId && (!role.userCount || role.userCount === 0) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoleToDelete(role);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 sx={{ fontSize: 16, color: "error.main" }} />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>

        {/* Permissions Matrix */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "white",
              border: `1px solid ${colors.BORDER}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: `1px solid ${colors.BORDER}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Access for {selectedRole || "Select a Role"}
                </Typography>
                <Chip label={`${currentRoleData?.permissions?.length || 0} Modules Controlled`} size="small" sx={{ fontWeight: 700, borderRadius: "8px" }} />
              </Stack>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                    <TableCell sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase" }}>Module Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase" }}>Read</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase" }}>Write</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRoleData?.permissions?.map((perm) => (
                    <TableRow key={perm.module} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ p: 1, borderRadius: "10px", bgcolor: alpha(theme.palette.primary.main, 0.05), color: "primary.main", display: "flex" }}>
                            <Info sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{perm.module}</Typography>
                        </Stack>
                      </TableCell>
                      {["read", "write"].map((action) => (
                        <TableCell key={action} align="center">
                          <Tooltip title={`${action.charAt(0).toUpperCase() + action.slice(1)} access for ${perm.module}`}>
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                              <Box sx={{ color: perm[action as keyof Omit<ModulePermission, "module">] ? "primary.main" : "text.disabled", display: "flex", opacity: perm[action as keyof Omit<ModulePermission, "module">] ? 1 : 0.3 }}>
                                {getPermissionIcon(action)}
                              </Box>
                              <Switch
                                size="small"
                                checked={perm[action as keyof Omit<ModulePermission, "module">] as boolean}
                                onChange={() => togglePermission(selectedRole, perm.module, action as keyof Omit<ModulePermission, "module">)}
                                color="primary"
                              />
                            </Stack>
                          </Tooltip>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Warning Note */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2,
              borderRadius: "16px",
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: "1px solid",
              borderColor: alpha(theme.palette.warning.main, 0.2),
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ p: 1, borderRadius: "50%", bgcolor: theme.palette.warning.main, color: "white", display: "flex" }}>
              <Lock sx={{ fontSize: 16 }} />
            </Box>
            <Typography variant="caption" sx={{ color: theme.palette.warning.dark, fontWeight: 600 }}>
              Caution: Changes to permissions are global and will immediately affect all users assigned to the "{selectedRole}" role. Ensure you have verified access levels before saving.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Role Modal */}
      <Dialog 
        open={isAddRoleModalOpen} 
        onClose={() => setIsAddRoleModalOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, width: "100%", maxWidth: 400, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Create New Role
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Define a new system role. You can configure individual module permissions after creation.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            label="Role Name"
            placeholder="e.g. Content Manager"
            value={newRoleName}
            onChange={(e) => handleStrictInputChange(e, (evt) => setNewRoleName(evt.target.value), undefined, "name")}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "12px" }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setIsAddRoleModalOpen(false)} 
            sx={{ borderRadius: "10px", color: "text.secondary", fontWeight: 700, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddRole}
            disabled={!newRoleName.trim() || createRoleMutation.isPending}
            sx={{ 
              borderRadius: "8px", 
              fontWeight: 600, 
              textTransform: "none", 
              px: 3,
            }}
          >
            {createRoleMutation.isPending ? "Creating..." : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Role Confirmation Modal */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, width: "100%", maxWidth: 400, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete the role "{roleToDelete?.role}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)} 
            sx={{ borderRadius: "10px", color: "text.secondary", fontWeight: 700, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => deleteRoleMutation.mutate(roleToDelete?.roleId)}
            disabled={deleteRoleMutation.isPending}
            sx={{ 
              borderRadius: "8px", 
              fontWeight: 600, 
              textTransform: "none" 
            }}
          >
            {deleteRoleMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionManagement;
