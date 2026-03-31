"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  Chip,
  alpha,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import React, { useState, useEffect } from "react";
import { useGetAllTemplates } from "@/hooks/form/useGetAllTemplates";
import { Close as CloseIcon } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { countries } from "@/utils/constant";
import { roboto } from "@/utils/fonts";
import { useFormik } from "formik";
import { CONTEST_VALIDATION } from "@/utils/validation";
import { contestControllers } from "@/api/contestControllers";
import { AddContestPayload, CONTESTDETAILS } from "@/types/user";
import moment from "moment";
import { SEVERITY } from "@/utils/enum";
import { useQuery } from "@tanstack/react-query";

const EditContestForm = () => {
  const { id } = useParams() as { id: string };
  const { templates, isLoading: isLoadingTemplates } = useGetAllTemplates();
  const theme = useTheme();
  const router = useRouter();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: AlertColor;
    message: string;
  }>({
    open: false,
    severity: "success",
    message: "",
  });

  const { data: contestData, isLoading: isLoadingContest } = useQuery({
    queryKey: ["contest", id],
    queryFn: () => contestControllers.getContestDetails(id),
    enabled: !!id,
  });

  const contest = contestData?.data as CONTESTDETAILS;

  const formik = useFormik<AddContestPayload>({
    initialValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      available_regions: [],
      user_level_template_id: "",
      entry_level_template_id: "",
    },
    validationSchema: CONTEST_VALIDATION,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload: AddContestPayload = {
          ...values,
          start_date: moment(values.start_date).format("YYYY-MM-DD"),
          end_date: moment(values.end_date).format("YYYY-MM-DD"),
        };
        await contestControllers.updateContest(id, payload).then((res) => {
          setSnackbar({
            open: true,
            severity: SEVERITY.SUCCESS,
            message: res.message || "Contest updated successfully",
          });
          router.push("/contest-management/contests");
        });
      } catch (error) {
        console.error("Failed to update contest:", error);
        setSnackbar({
          open: true,
          severity: SEVERITY.ERROR,
          message: "Failed to update contest",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (contest) {
      // Need to handle available_regions which might be string or array in detail API
      let regions: string[] = [];
      if (Array.isArray(contest.available_regions)) {
        regions = contest.available_regions;
      } else if (typeof contest.available_regions === "string") {
        try {
          regions = JSON.parse(contest.available_regions);
        } catch (e) {
          regions = contest.available_regions.split(",").map(r => r.trim());
        }
      }

      formik.setValues({
        name: contest.name || "",
        description: contest.description || "",
        start_date: contest.start_date || "",
        end_date: contest.end_date || "",
        available_regions: regions,
        user_level_template_id: contest.user_level_template_id || "",
        entry_level_template_id: contest.entry_level_template_id || "",
      });
    }
  }, [contest]);

  if (isLoadingContest || isLoadingTemplates) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const availableCountries = countries.filter(
    (c) =>
      !formik.values.available_regions.find(
        (selectedCode) => selectedCode === c.code,
      ),
  );

  return (
    <Box>
      <Box mb={4}>
        <Breadcrumb
          title="Edit Contest"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            {
              title: "Contest Management",
              href: "/contest-management/contests",
            },
            {
              title: "Edit Contest",
              href: `/contest-management/contests/${id}/edit`,
            },
          ]}
        />
      </Box>

      <Box component="form" onSubmit={formik.handleSubmit as any} noValidate>
        <Grid container spacing={4}>
          <Grid size={12}>
            <TextField
              label="Contest Name*"
              fullWidth
              variant="outlined"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Contest Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Provide a detailed description of the contest, rules, and objectives..."
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Start Date*"
                value={
                  formik.values.start_date
                    ? moment(formik.values.start_date)
                    : null
                }
                onChange={(value) =>
                  formik.setFieldValue("start_date", value?.toISOString())
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    sx: { "& .MuiOutlinedInput-root": { borderRadius: 3 } },
                    error:
                      formik.touched.start_date &&
                      Boolean(formik.errors.start_date),
                    helperText:
                      formik.touched.start_date && formik.errors.start_date,
                  },
                }}
                format="YYYY/MM/DD"
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="End Date*"
                value={
                  formik.values.end_date ? moment(formik.values.end_date) : null
                }
                onChange={(value) =>
                  formik.setFieldValue("end_date", value?.toISOString())
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    sx: { "& .MuiOutlinedInput-root": { borderRadius: 3 } },
                    error:
                      formik.touched.end_date &&
                      Boolean(formik.errors.end_date),
                    helperText:
                      formik.touched.end_date && formik.errors.end_date,
                  },
                }}
                format="YYYY/MM/DD"
                minDate={moment(formik.values.start_date)}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={12}>
            <Autocomplete
              multiple
              options={availableCountries}
              getOptionLabel={(option) => option.label || ""}
              value={countries.filter((c) =>
                formik.values.available_regions.includes(c.code),
              )}
              onChange={(event, newValue) => {
                formik.setFieldValue(
                  "available_regions",
                  newValue.map((c) => c.code),
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Available Regions*"
                  placeholder={
                    formik.values.available_regions.length === 0
                      ? "Select countries..."
                      : ""
                  }
                  error={
                    formik.touched.available_regions &&
                    Boolean(formik.errors.available_regions)
                  }
                  helperText={
                    formik.touched.available_regions &&
                    formik.errors.available_regions
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      padding: "10px 14px",
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                      },
                      "&.Mui-focused": { bgcolor: "background.paper" },
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={option.code}
                      {...tagProps}
                      label={option.label}
                      size="small"
                      deleteIcon={
                        <CloseIcon
                          style={{ fontSize: "14px", color: "white" }}
                        />
                      }
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        height: 28,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: "white",
                        boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        border: "none",
                        mx: 0.5,
                        my: 0.5,
                        "& .MuiChip-deleteIcon": {
                          color: "white",
                          opacity: 0.8,
                          "&:hover": { opacity: 1, color: "white" },
                        },
                      }}
                    />
                  );
                })
              }
            />
          </Grid>

          <Grid size={12}>
            <Autocomplete
              fullWidth
              options={templates}
              getOptionLabel={(option) => option.name || ""}
              value={
                templates.find(
                  (t) => t.id === formik.values.user_level_template_id,
                ) || null
              }
              onChange={(_, newValue) =>
                formik.setFieldValue(
                  "user_level_template_id",
                  newValue?.id || "",
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User Registration Form Template*"
                  error={
                    formik.touched.user_level_template_id &&
                    Boolean(formik.errors.user_level_template_id)
                  }
                  helperText={
                    formik.touched.user_level_template_id &&
                    formik.errors.user_level_template_id
                  }
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Typography
                    sx={{
                      textTransform: "capitalize",
                      fontFamily: roboto.style.fontFamily,
                    }}
                  >
                    {option.name}
                  </Typography>
                </Box>
              )}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              fullWidth
              options={templates}
              getOptionLabel={(option) => option.name || ""}
              value={
                templates.find(
                  (t) => t.id === formik.values.entry_level_template_id,
                ) || null
              }
              onChange={(_, newValue) =>
                formik.setFieldValue(
                  "entry_level_template_id",
                  newValue?.id || "",
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User Entry Form Template*"
                  error={
                    formik.touched.entry_level_template_id &&
                    Boolean(formik.errors.entry_level_template_id)
                  }
                  helperText={
                    formik.touched.entry_level_template_id &&
                    formik.errors.entry_level_template_id
                  }
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Typography
                    sx={{
                      textTransform: "capitalize",
                      fontFamily: roboto.style.fontFamily,
                    }}
                  >
                    {option.name}
                  </Typography>
                </Box>
              )}
            />
          </Grid>

          <Grid size={12}>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                sx={{ textTransform: "none", minWidth: "120px" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "16px",
                  minWidth: "150px",
                }}
              >
                {formik.isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update Contest"
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{
          horizontal: "right",
          vertical: "top",
        }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditContestForm;
