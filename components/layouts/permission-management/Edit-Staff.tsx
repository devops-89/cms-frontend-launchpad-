"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  alpha,
  useTheme,
  Stack,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { ChevronRight, ArrowBack, Visibility, VisibilityOff } from "@mui/icons-material";
import { useSnackbar } from "@/context/SnackbarContext";
import { useQuery } from "@tanstack/react-query";
import { roleControllers } from "@/api/roleControllers";
import { UserController } from "@/api/userControllers";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/context/ThemeContext";

const EditStaff = ({ userId }: { userId: string }) => {
  const theme = useTheme();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "" });
  const [originalUser, setOriginalUser] = useState({ name: "", email: "", password: "", role: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "", role: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: rolesData, isPending: isRolesPending } = useQuery({
    queryKey: ["roles"],
    queryFn: roleControllers.getAllRoles,
  });

  const { data: userData, isPending: isUserPending } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => UserController.getUserById(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (userData?.data?.data) {
      const user = userData.data.data;
      const initialData = {
        name: user.fullName || user.firstName || "",
        email: user.email || "",
        password: "", // Password is not returned, kept empty
        role: user.roleId || user.roleEntity?.id || "",
      };
      setNewUser(initialData);
      setOriginalUser(initialData);
    }
  }, [userData]);

  const availableRoles = rolesData?.data || [];

  const validateField = (field: string, value: string) => {
    let errorMsg = "";
    if (field === "name") {
      if (!value.trim()) errorMsg = "Full Name is required";
      else if (!/^[A-Za-z\s]+$/.test(value)) errorMsg = "Full Name can only contain alphabets and spaces";
    } else if (field === "email") {
      if (!value.trim()) errorMsg = "Email Address is required";
      else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value)) errorMsg = "Please enter a valid email address (e.g., .com, .in, .org)";
    } else if (field === "password") {
      // Password is optional on edit
      if (value && value.length < 6) errorMsg = "Password must be at least 6 characters";
      else if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(value)) errorMsg = "Password must contain at least one uppercase, one lowercase, one number, and one special character";
    } else if (field === "role") {
      if (!value) errorMsg = "Assign Role is required";
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    return errorMsg === "";
  };

  const validate = () => {
    const isNameValid = validateField("name", newUser.name);
    const isEmailValid = validateField("email", newUser.email);
    const isPasswordValid = validateField("password", newUser.password);
    const isRoleValid = validateField("role", newUser.role);
    
    return isNameValid && isEmailValid && isPasswordValid && isRoleValid;
  };

  const handleUpdateUser = async () => {
    if (!validate()) {
      showSnackbar("Please fix the validation errors", "error");
      return;
    }

    const hasChanges = 
      newUser.name !== originalUser.name ||
      newUser.email !== originalUser.email ||
      newUser.password !== "" ||
      newUser.role !== originalUser.role;

    if (!hasChanges) {
      showSnackbar("No changes detected", "warning");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        fullName: newUser.name,
        email: newUser.email,
        roleId: newUser.role,
      };
      if (newUser.password) {
        payload.password = newUser.password;
      }

      await UserController.editAdminUser(userId, payload);
      
      showSnackbar("Admin user updated successfully", "success");
      router.push("/permission-management/employees");
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || "Failed to update admin user";
      showSnackbar(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserPending) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "background.default", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Loading user data...</Typography>
      </Box>
    );
  }

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
        <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
          Edit Admin User
        </Typography>
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
            Edit Admin User
          </Typography>
          <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}>
            Update the admin user account details or system role.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => router.push("/permission-management/employees")}
          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
        >
          Back to List
        </Button>
      </Box>

      {/* Form */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 4,
          maxWidth: 600,
          bgcolor: "white",
          border: `1px solid ${colors.BORDER}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Full Name"
            value={newUser.name}
            onChange={(e) => {
              setNewUser({ ...newUser, name: e.target.value });
              validateField("name", e.target.value);
            }}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={newUser.email}
            onChange={(e) => {
              setNewUser({ ...newUser, email: e.target.value });
              validateField("email", e.target.value);
            }}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <TextField
            fullWidth
            label="Password (Leave blank to keep unchanged)"
            type={showPassword ? "text" : "password"}
            value={newUser.password}
            onChange={(e) => {
              setNewUser({ ...newUser, password: e.target.value });
              validateField("password", e.target.value);
            }}
            error={!!errors.password}
            helperText={errors.password}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth error={!!errors.role} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}>
            <InputLabel>Assign Role</InputLabel>
            <Select
              value={newUser.role}
              label="Assign Role"
              onChange={(e) => {
                setNewUser({ ...newUser, role: e.target.value });
                validateField("role", e.target.value);
              }}
            >
              {isRolesPending ? (
                <MenuItem value="" disabled>Loading roles...</MenuItem>
              ) : availableRoles.map((role: any) => (
                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
              ))}
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                {errors.role}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ pt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button 
              variant="contained" 
              onClick={handleUpdateUser}
              disabled={isSubmitting}
              sx={{ 
                borderRadius: "8px", 
                fontWeight: 600, 
                textTransform: "none", 
                px: 4,
                py: 1,
              }}
            >
              {isSubmitting ? "Saving..." : "Update Admin User"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default EditStaff;
