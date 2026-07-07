"use client";

import { roleControllers } from "@/api/roleControllers";
import { UserController } from "@/api/userControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";
import { ArrowBack, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  Grid
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { handleStrictInputChange } from "@/utils/inputValidations";

const validationSchema = Yup.object({
  name: Yup.string()
    .matches(/^[A-Za-z\s]+$/, "Full Name can only contain alphabets and spaces")
    .required("Full Name is required"),
  email: Yup.string()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, "Please enter a valid email address")
    .required("Email Address is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/, "Password must contain at least one uppercase, one lowercase, one number, and one special character")
    .required("Password is required"),
  role: Yup.string().required("Assign Role is required"),
});

const AddStaff = () => {
  const theme = useTheme();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  
  const [showPassword, setShowPassword] = useState(false);

  const { data: rolesData, isPending: isRolesPending } = useQuery({
    queryKey: ["roles"],
    queryFn: roleControllers.getAllRoles,
  });

  const availableRoles = rolesData?.data || [];

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await UserController.createAdminUser(values.role, {
          fullName: values.name,
          email: values.email,
          password: values.password
        });
        
        showSnackbar("Admin user added successfully", "success");
        router.push("/permission-management/employees");
      } catch (error: any) {
        console.error(error);
        const msg = error?.response?.data?.message || "Failed to add admin user";
        showSnackbar(msg, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Breadcrumb
          title="Add Admin User"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Admin Users", href: "/permission-management/employees" },
            { title: "Add Admin User", href: "#" },
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
            Add Admin User
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
          maxWidth: "100%",
          bgcolor: "white",
          border: `1px solid ${colors.BORDER}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <form onSubmit={formik.handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={(e) => handleStrictInputChange(e, formik.handleChange, formik.setFieldTouched, "name")}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={textFieldStyles}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={(e) => handleStrictInputChange(e, formik.handleChange, formik.setFieldTouched, "email")}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={(e) => handleStrictInputChange(e, formik.handleChange, formik.setFieldTouched, "default")}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={textFieldStyles}
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
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)} sx={textFieldStyles}>
                <InputLabel id="role-label">Assign Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formik.values.role}
                  label="Assign Role"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {isRolesPending ? (
                    <MenuItem value="" disabled>Loading roles...</MenuItem>
                  ) : availableRoles.map((role: any) => (
                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                  ))}
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {formik.errors.role as string}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ pt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button 
                  type="submit"
                  variant="contained" 
                  disabled={formik.isSubmitting}
                  sx={{ 
                    borderRadius: "8px", 
                    fontWeight: 600, 
                    textTransform: "none", 
                    px: 4,
                    py: 1,
                  }}
                >
                  {formik.isSubmitting ? "Saving..." : "Save Admin User"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddStaff;
