"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  FormLabel,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  ButtonGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  alpha,
  useTheme,
  Tooltip,
  Grow,
  Fade,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as ViewIcon,
  Label as LabelIcon,
  Favorite as FavoriteIcon,
  ChevronRight as RightIcon,
  ChevronLeft as LeftIcon,
  SettingsSuggest as ConfigIcon,
  DragIndicator as DragIcon,
  DesignServices as DesignIcon,
} from "@mui/icons-material";
import {
  useForms,
  FormField,
  FieldType,
  FieldVariant,
} from "@/context/FormContext";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useRouter } from "next/navigation";
import { countries } from "@/utils/constant";
import { MuiTelInput } from "mui-tel-input";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const FormBuilder = () => {
  const { addForm } = useForms();
  const theme = useTheme();
  const router = useRouter();
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type: "textfield",
      label: `New Field ${fields.length + 1}`,
      required: false,
      variant: "outlined",
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSave = () => {
    if (!formName.trim() || !formTitle.trim()) {
      alert("Please complete the form identity section.");
      return;
    }
    if (fields.length === 0) {
      alert("Please add at least one field.");
      return;
    }

    addForm({
      id: Math.random().toString(36).substr(2, 9),
      name: formName,
      title: formTitle,
      fields,
    });

    router.push("/contest-management/contests/add-contest");
  };

  const renderPreviewField = (field: FormField) => {
    const config = field.config || {};
    const commonProps = {
      fullWidth: true,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      helperText: field.helperText,
      error: field.required && !!field.helperText,
      variant: (field.variant || "outlined") as
        | "outlined"
        | "filled"
        | "standard",
    };

    switch (field.type) {
      case "textfield":
        return <TextField {...commonProps} />;
      case "numberField":
        return <TextField {...commonProps} type="number" />;
      case "telInput":
        return (
          <MuiTelInput
            {...commonProps}
            value=""
            defaultCountry={config.defaultCountry || "AE"}
            onlyCountries={config.onlyCountries || undefined}
            preferredCountries={config.preferredCountries || ["AE", "SA", "IN"]}
          />
        );
      case "datePicker":
        return (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label={field.label}
              disablePast={config.disablePast}
              disableFuture={config.disableFuture}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: field.variant || ("outlined" as any),
                  required: field.required,
                  helperText: field.helperText,
                  error: field.required && !!field.helperText,
                },
              }}
            />
          </LocalizationProvider>
        );
      case "checkbox":
        return (
           <FormControl error={field.required && !!field.helperText}>
            <FormControlLabel
              control={<Checkbox required={field.required} color="primary" />}
              label={field.label}
            />
            {field.helperText && (
              <Box component="span" sx={{ fontSize: "0.75rem", ml: 4, display: 'block' }}>
                {field.helperText}
              </Box>
            )}
          </FormControl>
        );
      case "switch":
        return (
           <FormControl error={field.required && !!field.helperText}>
            <FormControlLabel
              control={<Switch required={field.required} color="primary" />}
              label={field.label}
            />
            {field.helperText && (
              <Box component="span" sx={{ fontSize: "0.75rem", ml: 4, display: 'block' }}>
                {field.helperText}
              </Box>
            )}
          </FormControl>
        );
      case "select":
        return (
          <FormControl
            fullWidth
            variant={field.variant || "outlined"}
            error={field.required && !!field.helperText}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select label={field.label} required={field.required}>
              {field.options?.map((opt, i) => (
                <MenuItem key={i} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {field.helperText && (
              <Box component="span" sx={{ mt: 0.5, ml: 1.5, fontSize: "0.75rem" }}>
                {field.helperText}
              </Box>
            )}
          </FormControl>
        );
      case "autocomplete":
        return (
          <Autocomplete
            options={field.options || []}
            renderInput={(params) => <TextField {...params} {...commonProps} />}
          />
        );
      case "countrySelector":
        return (
          <Autocomplete
            options={countries}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => <TextField {...params} {...commonProps} />}
          />
        );
      case "radio":
        return (
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 600 }}>
              {field.label}
            </FormLabel>
            <RadioGroup row>
              {field.options?.map((opt, i) => (
                <FormControlLabel
                  key={i}
                  value={opt}
                  control={<Radio color="primary" />}
                  label={opt}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case "slider":
        return (
          <Box sx={{ px: 2 }}>
            <Typography gutterBottom variant="body2" fontWeight={600}>
              {field.label}
            </Typography>
            <Slider
              defaultValue={config.min || 0}
              valueLabelDisplay="auto"
              step={config.step || 1}
              marks
              min={config.min || 0}
              max={config.max || 100}
              color="primary"
            />
          </Box>
        );
      case "rating":
        return (
          <Box>
            <Typography gutterBottom variant="body2" fontWeight={600}>
              {field.label}
            </Typography>
            <Rating defaultValue={2} max={config.max || 5} />
          </Box>
        );
      case "button":
        return (
          <Button
            variant="contained"
            fullWidth
            sx={{ borderRadius: 2, height: 48, fontWeight: 700 }}
          >
            {field.label}
          </Button>
        );
      case "buttonGroup":
        return (
          <ButtonGroup variant="outlined" fullWidth color="primary">
            <Button>Option A</Button>
            <Button>Option B</Button>
            <Button>Option C</Button>
          </ButtonGroup>
        );
      case "fab":
        return (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2" fontWeight={600}>
              {field.label}
            </Typography>
            <Fab
              color="primary"
              size="small"
              sx={{ boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" }}
            >
              <AddIcon />
            </Fab>
          </Stack>
        );
      case "toggleButton":
        return (
          <ToggleButtonGroup color="primary" value="one" exclusive size="small">
            <ToggleButton value="one">Selected</ToggleButton>
            <ToggleButton value="two">Default</ToggleButton>
          </ToggleButtonGroup>
        );
      case "transferList":
        return (
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Grid size={5}>
              <Paper
                variant="outlined"
                sx={{
                  height: 100,
                  overflow: "auto",
                  bgcolor: "background.default",
                }}
              >
                <List dense role="list">
                  <ListItem>
                    <ListItemText primary="Item 1" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid size={2}>
              <Stack spacing={1} alignItems="center">
                <IconButton size="small" color="primary">
                  <RightIcon />
                </IconButton>
                <IconButton size="small" color="primary">
                  <LeftIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid size={5}>
              <Paper
                variant="outlined"
                sx={{
                  height: 100,
                  overflow: "auto",
                  bgcolor: "background.default",
                }}
              >
                <List dense role="list">
                  <ListItem>
                    <ListItemText primary="..." />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      p={4}
      sx={{
        background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%), 
                     radial-gradient(circle at 100% 100%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
                     ${theme.palette.background.default}`,
        minHeight: "100vh",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        },
      }}
    >
      <Box
        mb={4}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Breadcrumb
          title="Professional Form Builder"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Builder", href: "/form-builder" },
          ]}
        />
        <Stack direction="row" spacing={2}>
          <Tooltip title="Preview on Mobile">
            <IconButton
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Left Section: Editor */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={4}>
            {/* Form Identity Card */}
            <Card
              sx={{
                borderRadius: 6,
                backdropFilter: "blur(20px)",
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                border: "1px solid",
                borderColor: alpha(theme.palette.divider, 0.1),
                boxShadow: `0px 20px 50px ${alpha(theme.palette.common.black, 0.05)}`,
                overflow: "visible",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0px 30px 70px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.1),
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 100%)`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DesignIcon color="primary" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="1000"
                      color="text.primary"
                      sx={{ letterSpacing: -0.5 }}
                    >
                      Form Identity
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Define the core branding of your creation
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <CardContent sx={{ p: 5 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Internal ID Name"
                      placeholder="e.g., student_registration"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.background.default, 0.4),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Public Display Title"
                      placeholder="e.g., Dubai AI Summit 2025"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.background.default, 0.4),
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Fields Configuration Section */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
                sx={{
                  p: 3,
                  borderRadius: 5,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.4)} 0%, transparent 100%)`,
                  backdropFilter: "blur(10px)",
                  border: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.05),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2.5}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: "14px",
                      bgcolor: alpha(theme.palette.primary.main, 1),
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0px 10px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }}
                  >
                    <AddIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="1000"
                      color="text.primary"
                      sx={{ letterSpacing: -0.5 }}
                    >
                      Fields Workspace
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Currently configuring
                      </Typography>
                      <Chip
                        label={`${fields.length} Active Modules`}
                        size="small"
                        color="primary"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 900,
                          borderRadius: "6px",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addField}
                  sx={{
                    borderRadius: "16px",
                    px: 3.5,
                    height: 52,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: 900,
                    boxShadow: `0px 15px 35px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-3px) scale(1.02)",
                      boxShadow: `0px 20px 45px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }}
                >
                  Add Primary Field
                </Button>
              </Stack>

              <Stack spacing={3}>
                {fields.map((field, index) => (
                  <Grow in key={field.id} timeout={index * 100}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4.5,
                        borderRadius: 6,
                        position: "relative",
                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                        backdropFilter: "blur(30px)",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.divider, 0.08),
                        boxShadow: `0px 10px 30px ${alpha(theme.palette.common.black, 0.03)}`,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.paper, 0.6),
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          boxShadow: `0px 20px 60px ${alpha(theme.palette.primary.main, 0.08)}`,
                          transform: "translateY(-4px)",
                          "& .drag-indicator": {
                            opacity: 1,
                            color: theme.palette.primary.main,
                          },
                        },
                      }}
                    >
                      <Box
                        className="drag-indicator"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          opacity: 0.3,
                          transition: "0.2s",
                        }}
                      >
                        <DragIcon fontSize="small" />
                      </Box>

                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          color: "error.main",
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                        onClick={() => removeField(field.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>

                      <Grid container spacing={3} mt={0.5}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={field.type}
                              label="Type"
                              onChange={(e) =>
                                updateField(field.id, {
                                  type: e.target.value as FieldType,
                                })
                              }
                              sx={{ borderRadius: 2 }}
                            >
                              <MenuItem value="textfield">Text Input</MenuItem>
                              <MenuItem value="numberField">
                                Number Dial
                              </MenuItem>
                              <MenuItem value="telInput">
                                Phone Connection
                              </MenuItem>
                              <MenuItem value="datePicker">
                                Date Selection
                              </MenuItem>
                              <MenuItem value="autocomplete">
                                Smart Search
                              </MenuItem>
                              <MenuItem value="checkbox">Toggle Box</MenuItem>
                              <MenuItem value="switch">Switch Key</MenuItem>
                              <MenuItem value="select">Dropdown Menu</MenuItem>
                              <MenuItem value="radio">Radio Group</MenuItem>
                              <Divider />
                              <MenuItem value="slider">Range Slider</MenuItem>
                              <MenuItem value="rating">Visual Rating</MenuItem>
                              <MenuItem value="button">Call to Action</MenuItem>
                              <MenuItem value="buttonGroup">
                                Action Group
                              </MenuItem>
                              <MenuItem value="fab">Floating Trigger</MenuItem>
                              <MenuItem value="toggleButton">
                                Toggle Switch
                              </MenuItem>
                              <MenuItem value="transferList">
                                Transfer Zone
                              </MenuItem>
                              <MenuItem value="countrySelector">
                                Global Countries
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Field Label"
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, { label: e.target.value })
                            }
                            sx={{
                              "& .MuiOutlinedInput-root": { borderRadius: 2 },
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Aesthetic Variant</InputLabel>
                            <Select
                              value={field.variant || "outlined"}
                              label="Aesthetic Variant"
                              onChange={(e) =>
                                updateField(field.id, {
                                  variant: e.target.value as FieldVariant,
                                })
                              }
                              disabled={
                                ![
                                  "textfield",
                                  "numberField",
                                  "select",
                                  "autocomplete",
                                  "countrySelector",
                                  "telInput",
                                  "datePicker",
                                ].includes(field.type)
                              }
                              sx={{ borderRadius: 2 }}
                            >
                              <MenuItem value="outlined">
                                Outlined Modern
                              </MenuItem>
                              <MenuItem value="filled">Filled Soft</MenuItem>
                              <MenuItem value="standard">
                                Standard Minimal
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {[
                          "textfield",
                          "numberField",
                          "autocomplete",
                          "select",
                          "countrySelector",
                          "telInput",
                        ].includes(field.type) && (
                          <Grid size={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Hint Text"
                              placeholder="Placeholder..."
                              value={field.placeholder || ""}
                              onChange={(e) =>
                                updateField(field.id, {
                                  placeholder: e.target.value,
                                })
                              }
                              sx={{
                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                              }}
                            />
                          </Grid>
                        )}

                        <Grid size={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Validation Message / Helper Text"
                            placeholder="Message shown for guidance or error..."
                            value={field.helperText || ""}
                            onChange={(e) =>
                              updateField(field.id, {
                                helperText: e.target.value,
                              })
                            }
                            sx={{
                              "& .MuiOutlinedInput-root": { borderRadius: 2 },
                            }}
                          />
                        </Grid>

                        {["autocomplete", "select", "radio"].includes(
                          field.type,
                        ) && (
                          <Grid size={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Component Options"
                              placeholder="Alpha, Beta, Gamma"
                              value={field.options?.join(", ") || ""}
                              onChange={(e) =>
                                updateField(field.id, {
                                  options: e.target.value
                                    .split(",")
                                    .map((o) => o.trim())
                                    .filter((o) => o !== ""),
                                })
                              }
                              sx={{
                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                              }}
                              helperText="Separate options with commas"
                            />
                          </Grid>
                        )}

                        <Grid size={12}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.03),
                              borderRadius: 3,
                              border: "1px solid",
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.08,
                              ),
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              mb={1.5}
                            >
                              <ConfigIcon fontSize="small" color="primary" />
                              <Typography
                                variant="caption"
                                fontWeight={800}
                                color="primary"
                                sx={{ letterSpacing: 1 }}
                              >
                                ADVANCED CONFIGURATION
                              </Typography>
                            </Stack>

                            {field.type === "telInput" && (
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Primary Country</InputLabel>
                                    <Select
                                      value={
                                        field.config?.defaultCountry || "AE"
                                      }
                                      label="Primary Country"
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          config: {
                                            ...field.config,
                                            defaultCountry: e.target.value,
                                          },
                                        })
                                      }
                                      sx={{ borderRadius: 2 }}
                                    >
                                      {countries.map((c) => (
                                        <MenuItem key={c.code} value={c.code}>
                                          {c.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Allowed Countries</InputLabel>
                                    <Select
                                      multiple
                                      value={field.config?.onlyCountries || []}
                                      label="Allowed Countries"
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          config: {
                                            ...field.config,
                                            onlyCountries:
                                              typeof e.target.value === "string"
                                                ? e.target.value.split(",")
                                                : e.target.value,
                                          },
                                        })
                                      }
                                      renderValue={(selected) => (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.5,
                                          }}
                                        >
                                          {(selected as string[]).map(
                                            (value) => (
                                              <Chip
                                                key={value}
                                                label={value}
                                                size="small"
                                                color="primary"
                                                sx={{
                                                  fontWeight: 600,
                                                  height: 20,
                                                }}
                                              />
                                            ),
                                          )}
                                        </Box>
                                      )}
                                      sx={{ borderRadius: 2 }}
                                    >
                                      {countries.map((c) => (
                                        <MenuItem key={c.code} value={c.code}>
                                          {c.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                              </Grid>
                            )}

                            {(field.type === "slider" ||
                              field.type === "rating") && (
                              <Grid container spacing={2}>
                                <Grid size={4}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Floor"
                                    value={field.config?.min || 0}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        config: {
                                          ...field.config,
                                          min: Number(e.target.value),
                                        },
                                      })
                                    }
                                  />
                                </Grid>
                                <Grid size={4}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Ceiling"
                                    value={
                                      field.config?.max ||
                                      (field.type === "rating" ? 5 : 100)
                                    }
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        config: {
                                          ...field.config,
                                          max: Number(e.target.value),
                                        },
                                      })
                                    }
                                  />
                                </Grid>
                                {field.type === "slider" && (
                                  <Grid size={4}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="number"
                                      label="Precision"
                                      value={field.config?.step || 1}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          config: {
                                            ...field.config,
                                            step: Number(e.target.value),
                                          },
                                        })
                                      }
                                    />
                                  </Grid>
                                )}
                              </Grid>
                            )}

                            {field.type === "datePicker" && (
                              <Stack direction="row" spacing={3}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      size="small"
                                      checked={field.config?.disablePast}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          config: {
                                            ...field.config,
                                            disablePast: e.target.checked,
                                          },
                                        })
                                      }
                                    />
                                  }
                                  label={
                                    <Typography variant="body2">
                                      Archive Past
                                    </Typography>
                                  }
                                />
                                <FormControlLabel
                                  control={
                                    <Switch
                                      size="small"
                                      checked={field.config?.disableFuture}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          config: {
                                            ...field.config,
                                            disableFuture: e.target.checked,
                                          },
                                        })
                                      }
                                    />
                                  }
                                  label={
                                    <Typography variant="body2">
                                      Gate Future
                                    </Typography>
                                  }
                                />
                              </Stack>
                            )}

                            {![
                              "telInput",
                              "slider",
                              "rating",
                              "datePicker",
                            ].includes(field.type) && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontStyle="italic"
                                sx={{ opacity: 0.7 }}
                              >
                                Standard MUI behavior applied...
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        <Grid size={12}>
                          <Stack direction="row" spacing={4}>
                            <FormControlLabel
                              control={
                                <Switch
                                  color="primary"
                                  size="small"
                                  checked={field.required}
                                  onChange={(e) =>
                                    updateField(field.id, {
                                      required: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label={
                                <Typography variant="body2" fontWeight={700}>
                                  Mandatory Entry
                                </Typography>
                              }
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grow>
                ))}

                {fields.length === 0 && (
                  <Paper
                    sx={{
                      py: 8,
                      textAlign: "center",
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      borderRadius: 6,
                      border: "2px dashed",
                      borderColor: alpha(theme.palette.divider, 0.3),
                    }}
                  >
                    <DesignIcon
                      sx={{ fontSize: 64, color: "divider", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Your workspace is empty
                    </Typography>
                    <Typography color="text.secondary" sx={{ opacity: 0.6 }}>
                      Begin your creation by adding your first field
                    </Typography>
                  </Paper>
                )}
                {fields.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addField}
                      sx={{
                        borderRadius: "12px",
                        px: 4,
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: 800,
                        borderWidth: 2,
                        "&:hover": { 
                          borderWidth: 2,
                          transform: 'translateY(-2px)', 
                          bgcolor: alpha(theme.palette.primary.main, 0.05) 
                        }
                      }}
                    >
                      Add Another Field
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>

            <Box 
              sx={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                pt: 6,
                mt: 4,
                borderTop: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.05)
              }}
            >
              <Button
                size="large"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  px: 8,
                  height: 64,
                  borderRadius: "20px",
                  textTransform: "none",
                  fontWeight: 1000,
                  fontSize: "1.1rem",
                  letterSpacing: 0.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0px 20px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  "&:hover": { 
                    transform: "translateY(-5px) scale(1.02)",
                    boxShadow: `0px 25px 50px ${alpha(theme.palette.primary.main, 0.5)}`,
                  },
                }}
              >
                Launch Form Template
              </Button>
            </Box>
          </Stack>
        </Grid>

        {/* Right Section: Premium Preview */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            sx={{
              position: "sticky",
              top: 32,
              borderRadius: "32px",
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(40px)",
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.15),
              overflow: "hidden",
              boxShadow: `0px 40px 120px ${alpha(theme.palette.common.black, 0.15)}`,
              pb: 6,
            }}
          >
            <Box
              sx={{
                p: 3.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
                boxShadow: `0px 10px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#4ade80",
                    boxShadow: "0 0 10px #4ade80",
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(74, 222, 128, 0.7)" },
                      "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(74, 222, 128, 0)" },
                      "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(74, 222, 128, 0)" },
                    },
                  }}
                />
                <Typography variant="subtitle1" fontWeight="1000" sx={{ letterSpacing: 0.5 }}>
                  LIVE EXPERIENCE ENGINE
                </Typography>
              </Stack>
              <Chip
                label="SYNCHRONIZED"
                size="small"
                sx={{
                  bgcolor: alpha("#fff", 0.15),
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontWeight: 1000,
                  fontSize: "0.65rem",
                  letterSpacing: 1,
                  height: 24,
                }}
              />
            </Box>

            <CardContent sx={{ p: 5 }}>
              <Box sx={{ mb: 6, position: "relative" }}>
                <Typography
                  variant="h4"
                  fontWeight="1000"
                  color="text.primary"
                  sx={{ letterSpacing: -1 }}
                >
                  {formTitle || "Canvas Preview"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={0.5}
                  sx={{ opacity: 0.6 }}
                >
                  Ref: {formName || "unnamed_draft"}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    height: 4,
                    width: 60,
                    borderRadius: 2,
                    background: theme.palette.primary.main,
                  }}
                />
              </Box>

              <Stack spacing={4}>
                {fields.map((field) => (
                  <Fade in key={field.id} timeout={400}>
                    <Box>{renderPreviewField(field)}</Box>
                  </Fade>
                ))}

                {fields.length === 0 && (
                  <Box sx={{ py: 12, textAlign: "center", opacity: 0.3 }}>
                    <ConfigIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h6" fontWeight={700}>
                      Awaiting Structure
                    </Typography>
                    <Typography variant="body2">
                      Elements will populate here dynamically
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormBuilder;
