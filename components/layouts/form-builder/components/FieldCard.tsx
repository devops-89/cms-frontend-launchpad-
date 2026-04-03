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
  Divider,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Phone as TelIcon,
  Event as DateIcon,
  ViewDay as SplitIcon,
  ContentCopy as DuplicateIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
} from "@mui/icons-material";
import { FormField, FieldType, FieldVariant } from "@/context/FormContext";
import { fieldTypes } from "./Toolbox";
import { countries } from "@/utils/constant";
import { roboto } from "@/utils/fonts";
import { useGetAllTemplates } from "@/hooks/form/useGetAllTemplates";

interface FieldCardProps {
  field: FormField;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onUpdateConfig: (id: string, key: string, value: any) => void;
  onAddOption: (fieldId: string) => void;
  onRemoveOption: (fieldId: string, option: string) => void;
  newOptionText: string;
  setNewOptionText: (fieldId: string, text: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  index: number;
  totalFields: number;
  allFields?: FormField[];
}

const FieldCard: React.FC<FieldCardProps> = ({
  field,
  allFields = [],
  onRemove,
  onUpdate,
  onUpdateConfig,
  onAddOption,
  onRemoveOption,
  newOptionText,
  setNewOptionText,
  onDuplicate,
  onMove,
  index,
  totalFields,
}) => {
  const theme = useTheme();
  const { templates } = useGetAllTemplates();

  if (field.type === "step_break") {
    const fieldIndex = allFields.findIndex((f) => f.id === field.id);
    const precedingFields = allFields.slice(
      0,
      fieldIndex > -1 ? fieldIndex : 0,
    );

    return (
      <Grow in timeout={100}>
        <Paper
          sx={{
            p: 2,
            borderRadius: "20px",
            position: "relative",
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            border: "2px dashed",
            borderColor: theme.palette.secondary.main,
            my: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SplitIcon sx={{ color: "secondary.main" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "secondary.main",
                  textTransform: "uppercase",
                }}
              >
                Step / Page Boundary
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1.5}
              // sx={{ position: "absolute", top: 12, right: 12 }}
              justifyContent={"flex-end"}
            >
              <IconButton
                size="small"
                onClick={() => onMove(field.id, "up")}
                disabled={index === 0}
                sx={{
                  color: "secondary.main",
                  bgcolor: alpha(
                    theme.palette.secondary.main,
                    index === 0 ? 0 : 0.05,
                  ),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  },
                }}
              >
                <UpIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onMove(field.id, "down")}
                disabled={index === totalFields - 1}
                sx={{
                  color: "secondary.main",
                  bgcolor: alpha(
                    theme.palette.secondary.main,
                    index === totalFields - 1 ? 0 : 0.05,
                  ),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  },
                }}
              >
                <DownIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDuplicate(field.id)}
                sx={{
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <DuplicateIcon sx={{ fontSize: "0.9rem" }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onRemove(field.id)}
                sx={{
                  color: "error.main",
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) },
                }}
              >
                <DeleteIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Stack>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Step Title"
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    bgcolor: "white",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ bgcolor: "white", px: 0.5 }}>
                  Link Existing Form (Optional)
                </InputLabel>
                <Select
                  value={field.config?.linkedTemplateId || ""}
                  onChange={(e) =>
                    onUpdateConfig(field.id, "linkedTemplateId", e.target.value)
                  }
                  sx={{ borderRadius: "10px", bgcolor: "white" }}
                >
                  <MenuItem value="">
                    <em>None (Standard Modular Step)</em>
                  </MenuItem>
                  {templates.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.title || t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={!!field.config?.isInline}
                    onChange={(e) =>
                      onUpdateConfig(field.id, "isInline", e.target.checked)
                    }
                    color="secondary"
                  />
                }
                label={
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, color: "secondary.main" }}
                  >
                    Render Inline (Show on same page)
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </Paper>
      </Grow>
    );
  }

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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
            px: 0.5,
          }}
        >
          <Box sx={{ width: 100, display: { xs: "none", sm: "block" } }} />

          <Box
            sx={{
              color: "text.disabled",
              opacity: 0.3,
              display: "flex",
              alignItems: "center",
              cursor: "grab",
              "&:active": { cursor: "grabbing" },
            }}
          >
            <DragIcon fontSize="small" />
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              onClick={() => onMove(field.id, "up")}
              disabled={index === 0}
              sx={{
                color: "text.disabled",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <UpIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onMove(field.id, "down")}
              disabled={index === totalFields - 1}
              sx={{
                color: "text.disabled",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <DownIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDuplicate(field.id)}
              sx={{
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
              }}
            >
              <DuplicateIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onRemove(field.id)}
              sx={{
                color: "error.main",
                bgcolor: alpha(theme.palette.error.main, 0.03),
                "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) },
              }}
            >
              <DeleteIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Stack>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "0.8rem" }}>Type</InputLabel>
              <Select
                value={field.type}
                label="Type"
                onChange={(e) =>
                  onUpdate(field.id, { type: e.target.value as FieldType })
                }
                sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
              >
                {fieldTypes.map((ft) => (
                  <MenuItem
                    key={ft.type}
                    value={ft.type}
                    sx={{ fontSize: "0.8rem" }}
                  >
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
                onChange={(e) =>
                  onUpdate(field.id, {
                    variant: e.target.value as FieldVariant,
                  })
                }
                sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
              >
                <MenuItem value="outlined" sx={{ fontSize: "0.8rem" }}>
                  Outlined
                </MenuItem>
                <MenuItem value="filled" sx={{ fontSize: "0.8rem" }}>
                  Filled
                </MenuItem>
                <MenuItem value="standard" sx={{ fontSize: "0.8rem" }}>
                  Standard
                </MenuItem>
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
              onChange={(e) =>
                onUpdate(field.id, { placeholder: e.target.value })
              }
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
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                  {(field.options || []).map((opt) => (
                    <Box
                      key={opt}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 0.5,
                        pl: 1.5,
                        bgcolor: "white",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.divider, 0.4),
                      }}
                    >
                      <Typography
                        sx={{
                          flexGrow: 1,
                          fontWeight: 700,
                          fontSize: "0.75rem",
                        }}
                      >
                        {opt}
                      </Typography>
                      {field.config?.enableBranching &&
                        allFields.filter((f) => f.type === "step_break")
                          .length > 0 && (
                          <FormControl size="small" sx={{ minWidth: 160 }}>
                            <Select
                              displayEmpty
                              value={field.config?.routing?.[opt] || ""}
                              onChange={(e) => {
                                const newRouting = {
                                  ...(field.config?.routing || {}),
                                };
                                if (e.target.value)
                                  newRouting[opt] = e.target.value;
                                else delete newRouting[opt];
                                onUpdateConfig(field.id, "routing", newRouting);
                              }}
                              sx={{
                                fontSize: "0.65rem",
                                height: 28,
                                bgcolor: alpha(
                                  theme.palette.secondary.main,
                                  0.05,
                                ),
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                              }}
                            >
                               <MenuItem
                                value=""
                                sx={{ fontSize: "0.7rem", fontStyle: "italic" }}
                              >
                                Continue to next step
                              </MenuItem>
                              {allFields
                                .filter(
                                  (sb) =>
                                    sb.type === "step_break" &&
                                    sb.id !== field.id,
                                )
                                .map((sb, idx) => (
                                  <MenuItem
                                    key={sb.id}
                                    value={sb.id}
                                    sx={{ fontSize: "0.7rem" }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Chip
                                        label={`Step ${idx + 1}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          height: 16,
                                          fontSize: "0.55rem",
                                          fontWeight: 800,
                                          borderColor: alpha(
                                            theme.palette.secondary.main,
                                            0.3,
                                          ),
                                          color: "secondary.main",
                                        }}
                                      />
                                      Go to: {sb.label || "Unnamed Step"}
                                    </Box>
                                  </MenuItem>
                                ))}
                              <Divider />
                              <MenuItem
                                value="end_of_form"
                                sx={{
                                  fontSize: "0.7rem",
                                  color: "primary.main",
                                  fontWeight: 800,
                                }}
                              >
                                🏁 Jump to: End of Form
                              </MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      <IconButton
                        size="small"
                        onClick={() => onRemoveOption(field.id, opt)}
                        sx={{
                          color: "text.disabled",
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: "1rem" }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="New option..."
                    value={newOptionText || ""}
                    onChange={(e) => setNewOptionText(field.id, e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && onAddOption(field.id)
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "white",
                      },
                      "& .MuiInputBase-input": { fontSize: "0.75rem", py: 0.8 },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => onAddOption(field.id)}
                    sx={{
                      borderRadius: "8px",
                      minWidth: "36px",
                      px: 0,
                      height: "36px",
                      boxShadow: "none",
                    }}
                  >
                    <AddIcon sx={{ fontSize: "1.1rem" }} />
                  </Button>
                </Stack>

                {allFields.filter((f) => f.type === "step_break").length >
                  0 && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 1.5,
                      borderTop: "1px dashed",
                      borderColor: alpha(theme.palette.divider, 0.4),
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Switch
                      size="small"
                      checked={!!field.config?.enableBranching}
                      onChange={(e) =>
                        onUpdateConfig(
                          field.id,
                          "enableBranching",
                          e.target.checked,
                        )
                      }
                      color="secondary"
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "text.secondary" }}
                    >
                      Enable Branching Logic (Go to step based on answer)
                    </Typography>
                  </Box>
                )}
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
                      value={countries.find(
                        (c) =>
                          c.code === (field.config?.defaultCountry || "AE"),
                      )}
                      onChange={(e, v) =>
                        onUpdateConfig(field.id, "defaultCountry", v?.code)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Default"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              bgcolor: "white",
                            },
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
                      getOptionLabel={(option) =>
                        countries.find((c) => c.code === option)?.label ||
                        option
                      }
                      value={field.config?.onlyCountries || []}
                      onChange={(e, v) =>
                        onUpdateConfig(field.id, "onlyCountries", v)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Allowed"
                          placeholder="Search..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              bgcolor: "white",
                            },
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
                            sx={{
                              borderRadius: "5px",
                              fontWeight: 700,
                              height: 20,
                              fontSize: "0.6rem",
                            }}
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
                        onChange={(e) =>
                          onUpdateConfig(
                            field.id,
                            "disablePast",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Disable Past
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={!!field.config?.disableFuture}
                        onChange={(e) =>
                          onUpdateConfig(
                            field.id,
                            "disableFuture",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Disable Future
                      </Typography>
                    }
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
                  onChange={(e) =>
                    onUpdate(field.id, { required: e.target.checked })
                  }
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
