"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import React, { useState } from "react";
import { useForms } from "@/context/FormContext";
import { 
  Add as AddIcon, 
  Public as PublicIcon, 
  Close as CloseIcon 
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { countries } from "@/utils/constant";

const AddContestForm = () => {
  const { forms } = useForms();
  const theme = useTheme();
  const router = useRouter();
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<any[]>([]);

  // Filter out already selected countries from the list
  const availableCountries = countries.filter(
    (c) => !selectedCountries.find((sc) => sc.code === c.code)
  );

  return (
    <Box>
      <Box mb={4}>
        <Breadcrumb
          title="Add Contest"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Contest Management", href: "/contest-management/contests" },
            { title: "Add Contest", href: "/contest-management/contests/add-contest" },
          ]}
        />
      </Box>

      <Box component="section">
        <Grid container spacing={4}>
          <Grid size={12}>
            <TextField 
              label="Contest Name*" 
              fullWidth 
              variant="outlined" 
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }} 
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
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Start Date*"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    sx: { "& .MuiOutlinedInput-root": { borderRadius: 3 } }
                  },
                }}
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
                    sx: { "& .MuiOutlinedInput-root": { borderRadius: 3 } }
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={12}>
            <Autocomplete
              multiple
              options={availableCountries}
              getOptionLabel={(option) => option.label}
              value={selectedCountries}
              onChange={(event, newValue) => setSelectedCountries(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Available Regions*"
                  placeholder={selectedCountries.length === 0 ? "Select countries..." : ""}
                  sx={{ 
                    "& .MuiOutlinedInput-root": { 
                      borderRadius: 3,
                      padding: "10px 14px",
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: alpha(theme.palette.background.paper, 0.6) },
                      "&.Mui-focused": { bgcolor: "background.paper" }
                    } 
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
                      deleteIcon={<CloseIcon style={{ fontSize: "14px", color: "white" }} />}
                      sx={{
                        borderRadius: "10px",
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
                          "&:hover": { opacity: 1, color: "white" }
                        }
                      }}
                    />
                  );
                })
              }
            />
          </Grid>

          <Grid size={12}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 800, color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 4, height: 16, bgcolor: "primary.main", borderRadius: 1 }} />
              Form Configuration
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl fullWidth variant="outlined">
                <InputLabel>Select Form Template*</InputLabel>
                <Select
                  value={selectedForm}
                  label="Select Form Template*"
                  onChange={(e) => setSelectedForm(e.target.value)}
                  sx={{ borderRadius: 3 }}
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
                sx={{ height: 56, whiteSpace: "nowrap", borderRadius: 3, textTransform: "none", fontWeight: 800, px: 3, border: "2px solid" }}
              >
                Create New Form
              </Button>
            </Stack>
            {selectedForm && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderRadius: "20px",
                  border: "1px dashed",
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }}
              >
                <Typography variant="subtitle2" gutterBottom fontWeight="800" color="primary.main">
                  Selected Template Structure: {forms.find((f) => f.id === selectedForm)?.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 2, fontStyle: "italic" }}
                >
                  This template includes {forms.find((f) => f.id === selectedForm)?.fields.length} predefined modules.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {forms
                    .find((f) => f.id === selectedForm)
                    ?.fields.map((field, index) => (
                      <Chip 
                        key={index} 
                        label={`${field.label} • ${field.type}`} 
                        variant="outlined" 
                        size="small" 
                        sx={{ borderRadius: "8px", fontSize: "0.7rem", fontWeight: 700, bgcolor: "white", border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.1) }} 
                      />
                    ))}
                </Stack>
              </Box>
            )}
          </Grid>

          <Grid size={12}>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="large"
                sx={{ 
                  px: 8, 
                  py: 2, 
                  borderRadius: "16px", 
                  textTransform: "none", 
                  fontWeight: 900, 
                  fontSize: "1.1rem",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0px 20px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                  "&:hover": { transform: "translateY(-4px)", boxShadow: `0px 25px 50px ${alpha(theme.palette.primary.main, 0.5)}` }
                }}
              >
                Launch Contest
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AddContestForm;
