import React, { useState } from "react";
import { useSnackbar } from "@/context/SnackbarContext";
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
  Switch,
  Breadcrumbs,
  Link,
  Button,
  Chip,
  alpha,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Security as ShieldCheck,
  Save,
  Refresh as RefreshCcw,
  Info,
  ChevronRight,
  Lock,
  Visibility as Eye,
  Edit as Edit2,
  Add as Plus,
  Delete as Trash2,
} from "@mui/icons-material";
import { Montserrat, Roboto } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["700", "800", "900"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface ModulePermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface RolePermissions {
  role: string;
  permissions: ModulePermission[];
}

const INITIAL_DATA: RolePermissions[] = [
  {
    role: "Super Admin",
    permissions: [
      { module: "Dashboard", view: true, create: true, edit: true, delete: true },
      { module: "User Management", view: true, create: true, edit: true, delete: true },
      { module: "Contest Management", view: true, create: true, edit: true, delete: true },
      { module: "Form Builder", view: true, create: true, edit: true, delete: true },
    ],
  },
  {
    role: "Admin",
    permissions: [
      { module: "Dashboard", view: true, create: false, edit: true, delete: false },
      { module: "User Management", view: true, create: true, edit: true, delete: false },
      { module: "Contest Management", view: true, create: true, edit: true, delete: false },
      { module: "Form Builder", view: true, create: false, edit: true, delete: false },
    ],
  },
  {
    role: "Judge",
    permissions: [
      { module: "Dashboard", view: true, create: false, edit: false, delete: false },
      { module: "User Management", view: false, create: false, edit: false, delete: false },
      { module: "Contest Management", view: true, create: false, edit: true, delete: false },
      { module: "Form Builder", view: false, create: false, edit: false, delete: false },
    ],
  },
];

const PermissionManagement: React.FC = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState<RolePermissions[]>(INITIAL_DATA);
  const [selectedRole, setSelectedRole] = useState(INITIAL_DATA[0].role);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    
    // Check if role already exists
    if (data.some(r => r.role.toLowerCase() === newRoleName.toLowerCase())) {
      showSnackbar("Role already exists", "error");
      return;
    }

    const newRole: RolePermissions = {
      role: newRoleName,
      permissions: [
        { module: "Dashboard", view: false, create: false, edit: false, delete: false },
        { module: "User Management", view: false, create: false, edit: false, delete: false },
        { module: "Contest Management", view: false, create: false, edit: false, delete: false },
        { module: "Form Builder", view: false, create: false, edit: false, delete: false },
      ]
    };

    setData([...data, newRole]);
    setSelectedRole(newRoleName);
    setNewRoleName("");
    setIsAddRoleModalOpen(false);
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
      case "view": return <Eye sx={iconSx} />;
      case "create": return <Plus sx={iconSx} />;
      case "edit": return <Edit2 sx={iconSx} />;
      case "delete": return <Trash2 sx={iconSx} />;
      default: return null;
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
        <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
          Permission Management
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: montserrat.style.fontFamily,
              fontWeight: 900,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            System Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Configure and manage access levels for different system roles.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshCcw sx={{ fontSize: 18 }} />}
            onClick={() => setData(INITIAL_DATA)}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
          >
            Reset All
          </Button>
          <Button
            variant="contained"
            startIcon={<Save sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 800,
              px: 4,
              boxShadow: `0px 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            Save Changes
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Role Selector Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="overline" sx={{ fontWeight: 900, color: "text.disabled", letterSpacing: 1.5 }}>
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
                  {selectedRole === role.role ? <ShieldCheck sx={{ fontSize: 20 }} color="primary" /> : <Lock sx={{ fontSize: 16, opacity: 0.3 }} />}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>

        {/* Permissions Matrix */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper
            sx={{
              borderRadius: "24px",
              overflow: "hidden",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: alpha(theme.palette.divider, 0.08),
              boxShadow: "0px 10px 40px rgba(0,0,0,0.02)",
            }}
          >
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: "1px solid", borderColor: alpha(theme.palette.divider, 0.08) }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: montserrat.style.fontFamily }}>
                  Access for {selectedRole}
                </Typography>
                <Chip label={`${currentRoleData?.permissions.length} Modules Controlled`} size="small" sx={{ fontWeight: 700, borderRadius: "8px" }} />
              </Stack>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                    <TableCell sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase" }}>Module Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase" }}>View</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase" }}>Create</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase" }}>Edit</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase" }}>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRoleData?.permissions.map((perm) => (
                    <TableRow key={perm.module} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ p: 1, borderRadius: "10px", bgcolor: alpha(theme.palette.primary.main, 0.05), color: "primary.main", display: "flex" }}>
                            <Info sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{perm.module}</Typography>
                        </Stack>
                      </TableCell>
                      {["view", "create", "edit", "delete"].map((action) => (
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
          sx: { borderRadius: "20px", width: "100%", maxWidth: 400, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontFamily: montserrat.style.fontFamily, fontWeight: 800 }}>
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
            onChange={(e) => setNewRoleName(e.target.value)}
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
            disabled={!newRoleName.trim()}
            sx={{ 
              borderRadius: "10px", 
              fontWeight: 800, 
              textTransform: "none", 
              px: 3,
              boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            Create Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionManagement;
