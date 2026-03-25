import React from "react";
import {
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  Stack,
  Chip,
  Button,
  FormControlLabel,
  Switch,
  Autocomplete,
  alpha,
  useTheme,
  Grow,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Phone as TelIcon,
  Event as DateIcon,
} from "@mui/icons-material";
import { FormField, FieldType, FieldVariant } from "@/context/FormContext";
import { fieldTypes } from "./Toolbox";
import { countries } from "@/utils/constant";
import { roboto } from "@/utils/fonts";

interface FieldCardProps {
  field: FormField;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onUpdateConfig: (id: string, key: string, value: any) => void;
  onAddOption: (fieldId: string) => void;
  onRemoveOption: (fieldId: string, option: string) => void;
  newOptionText: string;
  setNewOptionText: (fieldId: string, text: string) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({
  field,
  onRemove,
  onUpdate,
  onUpdateConfig,
  onAddOption,
  onRemoveOption,
  newOptionText,
  setNewOptionText,
}) => {
  const theme = useTheme();

  return (
    <Grow in timeout={100}>
      <Paper
        sx={{
          p: 2,
          borderRadius: "20px",
          position: "relative",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.08),
          boxShadow: "0px 5px 15px rgba(0,0,0,0.01)",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0px 10px 25px ${alpha(theme.palette.primary.main, 0.05)}`,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            color: "text.disabled",
            opacity: 0.3,
          }}
        >
          <DragIcon fontSize="small" />
        </Box>
        <IconButton
          size="small"
          onClick={() => onRemove(field.id)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "error.main",
            bgcolor: alpha(theme.palette.error.main, 0.03),
          }}
        >
          <DeleteIcon sx={{ fontSize: "1.1rem" }} />
        </IconButton>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "0.8rem" }}>Type</InputLabel>
              <Select
                value={field.type}
                label="Type"
                onChange={(e) => onUpdate(field.id, { type: e.target.value as FieldType })}
                sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
              >
                {fieldTypes.map((ft) => (
                  <MenuItem key={ft.type} value={ft.type} sx={{ fontSize: "0.8rem" }}>
                    {ft.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Label"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                "& .MuiInputLabel-root": { fontSize: "0.8rem" },
                "& .MuiInputBase-input": { fontSize: "0.8rem" },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "0.8rem" }}>Variant</InputLabel>
              <Select
                value={field.variant || "outlined"}
                label="Variant"
                onChange={(e) => onUpdate(field.id, { variant: e.target.value as FieldVariant })}
                sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
              >
                <MenuItem value="outlined" sx={{ fontSize: "0.8rem" }}>Outlined</MenuItem>
                <MenuItem value="filled" sx={{ fontSize: "0.8rem" }}>Filled</MenuItem>
                <MenuItem value="standard" sx={{ fontSize: "0.8rem" }}>Standard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Placeholder"
              placeholder="Hint..."
              value={field.placeholder || ""}
              onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                "& .MuiInputLabel-root": { fontSize: "0.8rem" },
                "& .MuiInputBase-input": { fontSize: "0.8rem" },
              }}
            />
          </Grid>

          {["select", "radio", "autocomplete"].includes(field.type) && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "14px",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    mb: 1,
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "0.6rem",
                  }}
                >
                  Options List
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", gap: 0.8 }}>
                  {(field.options || []).map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      onDelete={() => onRemoveOption(field.id, opt)}
                      size="small"
                      deleteIcon={<CloseIcon style={{ fontSize: "12px" }} />}
                      sx={{
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        height: 22,
                        bgcolor: "white",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="New option..."
                    value={newOptionText || ""}
                    onChange={(e) => setNewOptionText(field.id, e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && onAddOption(field.id)}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white" },
                      "& .MuiInputBase-input": { fontSize: "0.75rem", py: 0.8 },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => onAddOption(field.id)}
                    sx={{ borderRadius: "8px", minWidth: "36px", px: 0, height: "36px", boxShadow: "none" }}
                  >
                    <AddIcon sx={{ fontSize: "1.1rem" }} />
                  </Button>
                </Stack>
              </Box>
            </Grid>
          )}

          {field.type === "telInput" && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "14px",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textTransform: "uppercase",
                    fontSize: "0.6rem",
                  }}
                >
                  <TelIcon sx={{ fontSize: "0.8rem" }} /> Country Config
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={countries}
                      getOptionLabel={(option) => option.label}
                      value={countries.find((c) => c.code === (field.config?.defaultCountry || "AE"))}
                      onChange={(e, v) => onUpdateConfig(field.id, "defaultCountry", v?.code)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Default"
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white" },
                            "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      multiple
                      options={countries.map((c) => c.code)}
                      getOptionLabel={(option) => countries.find((c) => c.code === option)?.label || option}
                      value={field.config?.onlyCountries || []}
                      onChange={(e, v) => onUpdateConfig(field.id, "onlyCountries", v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Allowed"
                          placeholder="Search..."
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white" },
                            "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                          }}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option}
                            label={option}
                            size="small"
                            sx={{ borderRadius: "5px", fontWeight: 700, height: 20, fontSize: "0.6rem" }}
                          />
                        ))
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          {field.type === "datePicker" && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "14px",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textTransform: "uppercase",
                    fontSize: "0.6rem",
                  }}
                >
                  <DateIcon sx={{ fontSize: "0.8rem" }} /> Restriction Rules
                </Typography>
                <Stack direction="row" spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={!!field.config?.disablePast}
                        onChange={(e) => onUpdateConfig(field.id, "disablePast", e.target.checked)}
                      />
                    }
                    label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Disable Past</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={!!field.config?.disableFuture}
                        onChange={(e) => onUpdateConfig(field.id, "disableFuture", e.target.checked)}
                      />
                    }
                    label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Disable Future</Typography>}
                  />
                </Stack>
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12 }} sx={{ mt: 0.5 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={field.required}
                  onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                />
              }
              label={
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, fontFamily: roboto.style.fontFamily }}
                >
                  Mandatory Module
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </Paper>
    </Grow>
  );
};

export default FieldCard;
