import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Switch,
  Slider,
  Rating,
  Button,
  FormLabel,
  RadioGroup,
  Radio,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Laptop as LaptopIcon,
  Tablet as TabletIcon,
  PhoneIphone as PhoneIcon,
  SettingsSuggest as ConfigIcon,
} from "@mui/icons-material";
import { FormField } from "@/context/FormContext";
import { countries } from "@/utils/constant";
import { montserrat, roboto } from "@/utils/fonts";
import { MuiTelInput } from "mui-tel-input";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

interface LivePreviewProps {
  fields: FormField[];
  formTitle: string;
  formName: string;
  viewMode: "desktop" | "tablet" | "mobile";
  setViewMode: (val: "desktop" | "tablet" | "mobile") => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({
  fields,
  formTitle,
  formName,
  viewMode,
  setViewMode,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [stepHistory, setStepHistory] = useState<number[]>([]);

  const pages = useMemo(() => {
    const chunks: FormField[][] = [];
    let currentChunk: FormField[] = [];

    fields.forEach((field) => {
      if (field.type === "step_break") {
        if (currentChunk.length > 0) chunks.push(currentChunk);
        currentChunk = [field];
      } else {
        currentChunk.push(field);
      }
    });
    if (currentChunk.length > 0) chunks.push(currentChunk);
    return chunks;
  }, [fields]);

  useEffect(() => {
    if (activeStep >= pages.length) {
      setActiveStep(Math.max(0, pages.length - 1));
    }
  }, [pages.length, activeStep]);

  const renderPreviewField = (field: FormField) => {
    const config = field.config || {};
    const commonProps = {
      fullWidth: true,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      helperText: field.helperText,
      error: field.required && !!field.helperText,
      variant: (field.variant || "outlined") as "outlined" | "filled" | "standard",
      sx: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          transition: "all 0.2s",
          "&:hover": { bgcolor: alpha(theme.palette.background.paper, 0.6) },
          "&.Mui-focused": { bgcolor: "background.paper" },
        },
        fontFamily: roboto.style.fontFamily,
      },
    };

    switch (field.type) {
      case "textfield":
        return <TextField {...commonProps} />;
      case "numberField":
        return <TextField {...commonProps} type="number" />;
      case "password":
        return <TextField {...commonProps} type="password" />;
      case "telInput":
        return (
          <MuiTelInput
            {...commonProps}
            value=""
            defaultCountry={(config.defaultCountry || "AE") as any}
            onlyCountries={config.onlyCountries?.length > 0 ? config.onlyCountries : undefined}
            sx={commonProps.sx}
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
                textField: { fullWidth: true, variant: field.variant || "outlined", required: field.required, sx: commonProps.sx },
              }}
            />
          </LocalizationProvider>
        );
      case "checkbox":
        return (
          <FormControlLabel
            control={<Checkbox required={field.required} color="primary" />}
            label={<Typography sx={{ fontFamily: roboto.style.fontFamily }}>{field.label}</Typography>}
          />
        );
      case "switch":
        return (
          <FormControlLabel
            control={<Switch checked={false} color="primary" />}
            label={<Typography sx={{ fontFamily: roboto.style.fontFamily }}>{field.label}</Typography>}
          />
        );
      case "select":
        return (
          <FormControl fullWidth variant={field.variant || "outlined"} sx={commonProps.sx}>
            <InputLabel>{field.label}</InputLabel>
            <Select 
              label={field.label} 
              required={field.required}
              value={formValues[field.id] || ""}
              onChange={(e) => setFormValues((p) => ({ ...p, [field.id]: e.target.value }))}
            >
              {field.options?.map((opt, i) => (
                <MenuItem key={i} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "autocomplete":
        return (
          <Autocomplete
            options={field.options || []}
            value={formValues[field.id] || null}
            onChange={(_, val) => setFormValues((p) => ({ ...p, [field.id]: val }))}
            renderInput={(params) => <TextField {...params} {...commonProps} />}
            sx={commonProps.sx}
          />
        );
      case "countrySelector":
        return (
          <Autocomplete
            options={countries}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => <TextField {...params} {...commonProps} />}
            sx={commonProps.sx}
          />
        );
      case "radio":
        return (
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily, color: "text.primary", mb: 0.5 }}
            >
              {field.label}
            </FormLabel>
            <RadioGroup 
              row
              value={formValues[field.id] || ""}
              onChange={(e) => setFormValues((p) => ({ ...p, [field.id]: e.target.value }))}
            >
              {field.options?.map((opt, i) => (
                <FormControlLabel
                  key={i}
                  value={opt}
                  control={<Radio color="primary" />}
                  label={<Typography sx={{ fontFamily: roboto.style.fontFamily }}>{opt}</Typography>}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case "slider":
        return (
          <Box sx={{ px: 1 }}>
            <Typography gutterBottom variant="body2" fontWeight={600} sx={{ fontFamily: roboto.style.fontFamily }}>
              {field.label}
            </Typography>
            <Slider defaultValue={config.min || 0} min={config.min || 0} max={config.max || 100} color="primary" />
          </Box>
        );
      case "rating":
        return (
          <Box>
            <Typography gutterBottom variant="body2" fontWeight={600} sx={{ fontFamily: roboto.style.fontFamily }}>
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
            sx={{ borderRadius: "10px", height: 48, fontWeight: 700, textTransform: "none", fontFamily: roboto.style.fontFamily, fontSize: "0.9rem" }}
          >
            {field.label}
          </Button>
        );
      default:
        return <Typography color="error">Preview not available for {field.type}</Typography>;
    }
  };

  const handleNextStep = () => {
    const currentPageFields = pages[activeStep] || [];
    let targetStepId: string | null = null;

    for (const field of currentPageFields) {
      if (["select", "radio", "autocomplete"].includes(field.type)) {
        if (!field.config?.enableBranching) continue;
        
        const val = formValues[field.id];
        if (val && field.config?.routing?.[val]) {
          targetStepId = field.config.routing[val];
        }
      }
    }

    setStepHistory((prev) => [...prev, activeStep]);

    if (targetStepId) {
      const targetPageIndex = pages.findIndex(
        (page) => page.length > 0 && page[0].type === "step_break" && page[0].id === targetStepId
      );
      if (targetPageIndex !== -1) {
        setActiveStep(targetPageIndex);
        return;
      }
    }

    setActiveStep((p) => p + 1);
  };

  const handleBackStep = () => {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory[stepHistory.length - 1];
      setStepHistory((prev) => prev.slice(0, -1));
      setActiveStep(prevStep);
    } else {
      setActiveStep((p) => Math.max(0, p - 1));
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 1, width: "100%", height: "100%" }}>
      <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="overline" sx={{ fontWeight: 900, color: "text.disabled", letterSpacing: 1 }}>
          Live Context
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, v) => v && setViewMode(v)}
          size="small"
          sx={{ bgcolor: "background.paper", borderRadius: "8px", height: 28, "& .MuiToggleButton-root": { border: "none" } }}
        >
          <ToggleButton value="desktop"><LaptopIcon sx={{ fontSize: "1rem" }} /></ToggleButton>
          <ToggleButton value="tablet"><TabletIcon sx={{ fontSize: "1rem" }} /></ToggleButton>
          <ToggleButton value="mobile"><PhoneIcon sx={{ fontSize: "1rem" }} /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper
        sx={{
          borderRadius: "28px",
          overflow: "hidden",
          border: "6px solid #1e293b",
          bgcolor: "white",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          mx: "auto",
          width: viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "80%" : "280px",
          boxShadow: "0px 30px 60px rgba(0,0,0,0.12)",
        }}
      >
        <Box sx={{ p: 1, bgcolor: "#1e293b", color: "white", display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: 35, height: 3, borderRadius: 2, bgcolor: alpha("#fff", 0.15) }} />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 2.2,
            "&::-webkit-scrollbar": { width: "3px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: alpha(theme.palette.divider, 0.1), borderRadius: "10px" },
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 0.5, fontWeight: 900, fontFamily: montserrat.style.fontFamily, fontSize: "1.1rem" }}
          >
            {formTitle || "New Experience"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 3, fontStyle: "italic", fontSize: "0.65rem" }}
          >
            ID: {formName || "draft"}
          </Typography>
          <Stack spacing={2.5}>
            {pages[activeStep]?.map((field) => {
              if (field.type === "step_break") {
                return (
                  <Box
                    key={field.id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                      borderLeft: `3px solid ${theme.palette.secondary.main}`,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "secondary.main", fontSize: "0.8rem" }}>
                      {field.label || "Unnamed Step"}
                    </Typography>
                    {field.config?.linkedTemplateId && (
                      <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 0.5, fontWeight: 700 }}>
                        🔗 Nested Form Template attached
                      </Typography>
                    )}
                  </Box>
                );
              }
              return <Box key={field.id}>{renderPreviewField(field)}</Box>;
            })}
            {fields.length === 0 && (
              <Box sx={{ py: 6, textAlign: "center", opacity: 0.15 }}>
                <ConfigIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="caption" display="block" fontWeight={800}>
                  Awaiting Building Blocks
                </Typography>
              </Box>
            )}

            {pages.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  size="small"
                  disabled={stepHistory.length === 0 && activeStep === 0}
                  onClick={handleBackStep}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Back
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={activeStep === pages.length - 1}
                  onClick={handleNextStep}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Next Step
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
        <Box sx={{ p: 1, bgcolor: "#1e293b", textAlign: "center" }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", mx: "auto" }} />
        </Box>
      </Paper>
    </Box>
  );
};

// Internal sub-component for Radio (RadioGroup/Radio are now imported at top)

export default LivePreview;
