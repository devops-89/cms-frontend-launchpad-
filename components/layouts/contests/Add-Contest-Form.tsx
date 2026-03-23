"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import React, { useState } from "react";
import { useForms } from "@/context/FormContext";
import { Add as AddIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const AddContestForm = () => {
  const { forms } = useForms();
  const router = useRouter();
  const [selectedForm, setSelectedForm] = useState("");

  return (
    <Box p={3}>
      <Box mb={4}>
        <Breadcrumb
          title="Add Contest"
          data={[
            {
              title: "Dashboard",
              href: "/dashboard",
            },
            {
              title: "Contest Management",
              href: "/contest-management/contests",
            },
            {
              title: "Add Contest",
              href: "/contest-management/contests/add-contest",
            },
          ]}
        />
      </Box>
      <Box component="section" sx={{ maxWidth: 800, mx: "auto" }}>
        <Grid container spacing={4}>
          <Grid size={12}>
            <TextField label="Contest Name*" fullWidth variant="outlined" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Start Date*"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
                disableFuture
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="End Date*"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
                disableFuture
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={12}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl fullWidth variant="outlined">
                <InputLabel>Select Form Template*</InputLabel>
                <Select
                  value={selectedForm}
                  label="Select Form Template*"
                  onChange={(e) => setSelectedForm(e.target.value)}
                >
                  {forms.map((form) => (
                    <MenuItem key={form.id} value={form.id}>
                      {form.title || form.name}
                    </MenuItem>
                  ))}
                  {forms.length === 0 && (
                    <MenuItem disabled>No forms available</MenuItem>
                  )}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => router.push("/form-builder")}
                sx={{ height: 56, whiteSpace: "nowrap", borderRadius: 2 }}
              >
                Create New Form
              </Button>
            </Stack>
            {selectedForm && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="700">Form Preview: {forms.find(f => f.id === selectedForm)?.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                        Contains {forms.find(f => f.id === selectedForm)?.fields.length} fields.
                    </Typography>
                    <Stack spacing={1}>
                        {forms.find(f => f.id === selectedForm)?.fields.map((field, index) => (
                            <Typography key={index} variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                • {field.label} ({field.type}) - {field.variant || "outlined"}
                            </Typography>
                        ))}
                    </Stack>
                </Box>
            )}
          </Grid>

          <Grid size={12}>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button 
                variant="contained" 
                size="large" 
                sx={{ px: 5, py: 1.5, borderRadius: 2 }}
              >
                Save Contest
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AddContestForm;
