"use client";

import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import { Edit as EditIcon, Person as PersonIcon, EmailOutlined, PhoneOutlined, BusinessCenterOutlined } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Paper,
  TextField,
  Typography,
  Grid,
  Autocomplete,
  Chip,
  CircularProgress
} from "@mui/material";
import { EXPERTISE_OPTIONS } from "@/utils/constant";
import { useFormik } from "formik";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { AuthControllers } from "../../api/authControllers";
import { UserController } from "@/api/userControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { handleStrictInputChange } from "@/utils/inputValidations";

interface ProfileProps {
  mode: "admin" | "judge";
  token: string;
}

export const Profile = ({ mode, token }: ProfileProps) => {
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await AuthControllers.getMe(token);
      const data = res?.data?.data || res?.data || {};
      setUserData(data);
      
      formik.setValues({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phone || "",
        phoneNumber_country: "",
        expertise: data.judgeProfile?.expertise || [],
      });
      
      if (data.avatarDownloadUrl || data.avatarUrl) {
        setPreviewUrl(data.avatarDownloadUrl || data.avatarUrl);
      }
    } catch (err: any) {
      console.error("Failed to fetch profile", err);
      showSnackbar("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileData();
    }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      phoneNumber_country: "",
      expertise: [] as string[],
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed")
        .required("First Name is required"),
      lastName: Yup.string()
        .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed")
        .required("Last Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phoneNumber: Yup.string()
        .required("Phone Number is required")
        .test("isValidTel", "Invalid phone number", (value) => {
          if (!value) return false;
          return matchIsValidTel(value);
        }),
      expertise: Yup.array().of(Yup.string()),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("phone", values.phoneNumber);
        
        if (selectedFile) {
          formData.append("avatarUrl", selectedFile);
        }
        
        if (!userData?.id) {
          showSnackbar("User ID is missing", "error");
          setSubmitting(false);
          return;
        }

        if (mode === "judge") {
          formData.append("expertise", JSON.stringify(values.expertise));
          await UserController.editJudge(userData.id, formData);
        } else {
          await AuthControllers.updateMe(userData.id, formData, token);
        }

        showSnackbar("Profile updated successfully!", "success");
        setIsEditing(false); // Close edit view after successful update
        await fetchProfileData(); // Refresh data
        
        // Update user session
        const sessionKey = mode === "judge" ? "judge_user" : "user";
        const sessionUser = sessionStorage.getItem(sessionKey);
        if (sessionUser) {
          const parsed = JSON.parse(sessionUser);
          parsed.firstName = values.firstName;
          parsed.lastName = values.lastName;
          sessionStorage.setItem(sessionKey, JSON.stringify(parsed));
          window.dispatchEvent(new Event("storage"));
        }

      } catch (err: any) {
        showSnackbar(
          err?.response?.data?.message || "Failed to update profile",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showSnackbar("File size is too large (Max: 5MB)", "error");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      formik.setFieldTouched("avatarUrl", true);
    }
  };

  const breadcrumbLinks = [
    { title: "Dashboard", href: mode === "judge" ? "/judge-panel/dashboard" : "/dashboard" },
    { title: "My Profile", href: "#" },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: colors.PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Breadcrumb title="My Profile" data={breadcrumbLinks} />
      </Box>

      <Paper
        elevation={0}
        sx={{
          padding: { xs: 3, md: 4 },
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${colors.BORDER}`,
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.TEXT_PRIMARY }}>
            Profile Summary
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(!isEditing)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: isEditing ? colors.TEXT_SECONDARY : colors.PRIMARY,
              borderColor: isEditing ? colors.BORDER : colors.PRIMARY,
              "&:hover": {
                borderColor: isEditing ? colors.BORDER : colors.PRIMARY,
                bgcolor: isEditing ? "rgba(0,0,0,0.05)" : "transparent",
              }
            }}
          >
            {isEditing ? "Cancel" : "Edit Details"}
          </Button>
        </Box>
        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          {/* Left Column: Avatar & Contact Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: { xs: 2, md: 0 }, pb: 4, px: 2, height: "100%", justifyContent: "flex-start" }}>
              <Avatar
                src={previewUrl || ""}
                sx={{
                  width: 160,
                  height: 160,
                  mb: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  bgcolor: colors.PRIMARY,
                  border: `4px solid #fff`,
                }}
              >
                {!previewUrl && <PersonIcon sx={{ fontSize: 72, color: "#fff" }} />}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.TEXT_PRIMARY, textAlign: "center", mb: 1 }}>
                {userData?.firstName} {userData?.lastName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: (mode === "judge" ? userData?.judgeProfile?.isActive : (userData?.status === "Active" || !userData?.status)) ? "#10b981" : "#ef4444",
                    mr: 1
                  }}
                />
                <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}>
                  {mode === "judge" 
                    ? (userData?.judgeProfile?.isActive ? "Active" : "Inactive") 
                    : (userData?.status || "Active")}
                </Typography>
              </Box>

              <Box sx={{ width: "100%", p: 2.5, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 3, border: `1px solid rgba(0,0,0,0.04)` }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EmailOutlined sx={{ color: colors.PRIMARY, mr: 2, fontSize: 22 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, display: "block", mb: 0.2 }}>Email Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY, wordBreak: "break-all" }}>
                      {userData?.email || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5, borderColor: "rgba(0,0,0,0.06)" }} />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PhoneOutlined sx={{ color: colors.PRIMARY, mr: 2, fontSize: 22 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, display: "block", mb: 0.2 }}>Phone Number</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>
                      {userData?.phone || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Other Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ p: { xs: 2, md: 3 }, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY, mb: 3, display: "flex", alignItems: "center" }}>
                <BusinessCenterOutlined sx={{ mr: 1.5, color: colors.PRIMARY }} /> Account Details
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.BORDER}`, bgcolor: "rgba(255,255,255,0.5)" }}>
                    <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, mb: 1, display: "block" }}>First Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.TEXT_PRIMARY }}>
                      {userData?.firstName || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.BORDER}`, bgcolor: "rgba(255,255,255,0.5)" }}>
                    <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, mb: 1, display: "block" }}>Last Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: colors.TEXT_PRIMARY }}>
                      {userData?.lastName || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
                {mode === "judge" && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.BORDER}`, bgcolor: "rgba(255,255,255,0.5)" }}>
                      <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, mb: 1, display: "block" }}>Expertise</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {userData?.judgeProfile?.expertise?.length > 0 
                          ? userData.judgeProfile.expertise.map((exp: string, idx: number) => (
                              <Chip key={idx} label={exp} size="small" sx={{ bgcolor: colors.PRIMARY + '20', color: colors.PRIMARY, fontWeight: 500 }} />
                            ))
                          : <Typography variant="body2" color="textSecondary">None specified</Typography>
                        }
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Collapsible Edit Section */}
      <Collapse in={isEditing}>
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            padding: { xs: 3, md: 4 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${colors.BORDER}`,
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>
              Edit Details
            </Typography>
          </Box>
          <Divider sx={{ mb: 4 }} />

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={previewUrl || ""}
                      sx={{
                        width: 140,
                        height: 140,
                        border: `4px solid ${colors.BACKGROUND}`,
                        bgcolor: colors.PRIMARY,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                    >
                      {!previewUrl && <PersonIcon sx={{ fontSize: 64, color: "#fff" }} />}
                    </Avatar>

                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="avatar-upload">
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 4,
                          right: 4,
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          border: "1px solid #e2e8f0",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                            bgcolor: "#f8fafc",
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 18, color: colors.TEXT_PRIMARY }} />
                      </Box>
                    </label>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      variant="outlined"
                      value={formik.values.firstName}
                      onChange={(e) => handleStrictInputChange(e, formik.handleChange)}
                      onBlur={formik.handleBlur}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName as string}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      variant="outlined"
                      value={formik.values.lastName}
                      onChange={(e) => handleStrictInputChange(e, formik.handleChange)}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName as string}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      disabled
                      id="email"
                      name="email"
                      label="Email Address"
                      variant="outlined"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email as string}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <MuiTelInput
                      fullWidth
                      id="phoneNumber"
                      name="phoneNumber"
                      label="Phone Number"
                      defaultCountry="IN"
                      value={formik.values.phoneNumber}
                      onChange={(val, info) => {
                        formik.setFieldValue("phoneNumber", val);
                        const phoneNumberObj = parsePhoneNumberFromString(val);
                        if (phoneNumberObj) {
                          formik.setFieldValue("phoneNumber_country", phoneNumberObj.country);
                        }
                      }}
                      onBlur={() => formik.setFieldTouched("phoneNumber", true)}
                      error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                      helperText={formik.touched.phoneNumber && formik.errors.phoneNumber as string}
                    />
                  </Grid>

                  {mode === "judge" && (
                    <Grid size={{ xs: 12 }}>
                      <Autocomplete
                        multiple
                        options={EXPERTISE_OPTIONS}
                        value={formik.values.expertise || []}
                        onChange={(event, newValue) => {
                          formik.setFieldValue("expertise", newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Expertise"
                            variant="outlined"
                            error={formik.touched.expertise && Boolean(formik.errors.expertise)}
                            helperText={formik.touched.expertise && formik.errors.expertise as string}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              {...getTagProps({ index })}
                              key={index}
                            />
                          ))
                        }
                      />
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderColor: colors.BORDER,
                      color: colors.TEXT_PRIMARY,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { borderColor: colors.TEXT_PRIMARY }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={formik.isSubmitting || (!formik.dirty && !selectedFile)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: colors.PRIMARY,
                      "&:hover": {
                        bgcolor: colors.SECONDARY,
                      },
                    }}
                  >
                    {formik.isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Collapse>
    </Box>
  );
};
