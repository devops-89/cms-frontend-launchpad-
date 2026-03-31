import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ShortText as TextIcon,
  Numbers as NumbersIcon,
  Phone as TelIcon,
  Event as DateIcon,
  ChevronRight as RightIcon,
  ArrowDropDownCircle as SelectIcon,
  RadioButtonChecked as RadioIcon,
  CheckCircle as CheckIcon,
  SwitchRight as SwitchIcon,
  LinearScale as SliderIcon,
  Star as RatingIcon,
  Public as GlobalIcon,
  SmartButton as ButtonIcon,
  Password as PasswordIcon,
} from "@mui/icons-material";
import { FieldType } from "@/context/FormContext";
import { montserrat } from "@/utils/fonts";

export const fieldTypes: {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
  category: string;
}[] = [
  { type: "textfield", label: "Text Input", icon: <TextIcon />, category: "Basic" },
  { type: "numberField", label: "Number Input", icon: <NumbersIcon />, category: "Basic" },
  { type: "password", label: "Password Input", icon: <PasswordIcon />, category: "Basic" },
  { type: "telInput", label: "Phone Connection", icon: <TelIcon />, category: "Input" },
  { type: "datePicker", label: "Date Selection", icon: <DateIcon />, category: "Input" },
  { type: "autocomplete", label: "Smart Search", icon: <RightIcon />, category: "Selection" },
  { type: "select", label: "Dropdown Menu", icon: <SelectIcon />, category: "Selection" },
  { type: "radio", label: "Radio Group", icon: <RadioIcon />, category: "Selection" },
  { type: "checkbox", label: "Toggle Box", icon: <CheckIcon />, category: "Toggle" },
  { type: "switch", label: "Switch Key", icon: <SwitchIcon />, category: "Toggle" },
  { type: "slider", label: "Range Slider", icon: <SliderIcon />, category: "Visual" },
  { type: "rating", label: "Visual Rating", icon: <RatingIcon />, category: "Visual" },
  { type: "countrySelector", label: "Global Countries", icon: <GlobalIcon />, category: "Input" },
  { type: "button", label: "Primary Button", icon: <ButtonIcon />, category: "Actions" },
];

interface ToolboxProps {
  onAddField: (type: FieldType, label: string) => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ onAddField }) => {
  const theme = useTheme();

  return (
    <Box sx={{ height: "100%" }}>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1.5,
          fontWeight: 800,
          fontFamily: montserrat.style.fontFamily,
          color: "text.secondary",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          fontSize: "0.65rem",
        }}
      >
        Elements Toolbox
      </Typography>
      <Paper
        sx={{
          p: 1,
          borderRadius: "20px",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.08),
          boxShadow: "0px 10px 30px rgba(0,0,0,0.02)",
          height: "calc(100% - 35px)",
          overflow: "auto",
        }}
      >
        <Stack spacing={0.5}>
          {["Basic", "Input", "Selection", "Toggle", "Visual", "Actions"].map((cat) => (
            <Box key={cat}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 1,
                  mt: 0.5,
                  display: "block",
                  color: "text.disabled",
                  fontWeight: 800,
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                }}
              >
                {cat}
              </Typography>
              {fieldTypes
                .filter((f) => f.category === cat)
                .map((item) => (
                  <Button
                    key={item.type}
                    fullWidth
                    startIcon={
                      <Box sx={{ color: "primary.main", display: "flex", scale: "0.8" }}>
                        {item.icon}
                      </Box>
                    }
                    onClick={() => onAddField(item.type, item.label)}
                    sx={{
                      justifyContent: "flex-start",
                      py: 0.8,
                      px: 1.5,
                      borderRadius: "10px",
                      textTransform: "none",
                      color: "text.primary",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Toolbox;
