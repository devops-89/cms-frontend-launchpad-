"use client";

import React from "react";
import DashboardLayout from "@/components/layouts/Dashboard";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { Moment } from "moment";
import { useAppTheme } from "@/context/ThemeContext";

export default function CreateContestPage() {
  const { colors, mode } = useAppTheme();
  const [formData, setFormData] = React.useState({
    title: "",
    startDate: null as Moment | null,
    endDate: null as Moment | null,
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string) => (value: Moment | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      startDate: formData.startDate?.format("YYYY-MM-DD"),
      endDate: formData.endDate?.format("YYYY-MM-DD"),
    };
    console.log("Contest Created:", submissionData);
    alert("Contest created successfully (simulated)");
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: colors.TEXT_PRIMARY,
      "& fieldset": { borderColor: colors.BORDER },
      "&:hover fieldset": { borderColor: colors.PRIMARY },
      "&.Mui-focused fieldset": { borderColor: colors.PRIMARY },
    },
    "& .MuiInputLabel-root": { color: colors.TEXT_SECONDARY },
    "& .MuiInputLabel-root.Mui-focused": { color: colors.PRIMARY },
    "& .MuiIconButton-root": { color: colors.TEXT_SECONDARY },
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Typography
          variant="h4"
          sx={{
            color: colors.TEXT_PRIMARY,
            fontWeight: 700,
            mb: 1,
            letterSpacing: "-0.5px",
          }}
        >
          Create New Contest
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: colors.TEXT_SECONDARY, mb: 4 }}
        >
          Fill in the details below to launch a new challenge.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: colors.SURFACE,
            backdropFilter: "blur(10px)",
            border: `1px solid ${colors.BORDER}`,
            borderRadius: 3,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Contest Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={handleDateChange("startDate")}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        sx: textFieldStyles,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={handleDateChange("endDate")}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        sx: textFieldStyles,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    sx={{ mt: 2 }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        color: colors.TEXT_PRIMARY,
                        borderColor: colors.BORDER,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: colors.TEXT_SECONDARY,
                          bgcolor: "rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        bgcolor: colors.PRIMARY,
                        px: 4,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: colors.PRIMARY,
                          opacity: 0.9,
                          boxShadow: `0 8px 16px ${colors.PRIMARY}40`,
                        },
                      }}
                    >
                      Create Contest
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </LocalizationProvider>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
