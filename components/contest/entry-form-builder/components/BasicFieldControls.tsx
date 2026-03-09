"use client";

import React from "react";
import {
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FormField } from "../types";

interface BasicFieldControlsProps {
  selectedField: FormField;
  onChange: (updated: FormField) => void;
  colors: Record<string, string>;
  inputSx: any;
}

const BasicFieldControls: React.FC<BasicFieldControlsProps> = ({
  selectedField,
  onChange,
  colors,
  inputSx,
}) => {
  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label="Label"
        value={selectedField.label}
        onChange={(e) => onChange({ ...selectedField, label: e.target.value })}
        sx={inputSx}
      />

      {selectedField.type !== "checkbox" &&
        selectedField.type !== "country" && (
          <>
            <TextField
              fullWidth
              label="Placeholder"
              value={selectedField.placeholder}
              onChange={(e) =>
                onChange({ ...selectedField, placeholder: e.target.value })
              }
              sx={inputSx}
            />
            <TextField
              fullWidth
              label="Default Value"
              value={selectedField.defaultValue || ""}
              onChange={(e) =>
                onChange({ ...selectedField, defaultValue: e.target.value })
              }
              sx={inputSx}
            />
          </>
        )}

      <TextField
        fullWidth
        label="Helper Text"
        value={selectedField.helperText || ""}
        onChange={(e) =>
          onChange({ ...selectedField, helperText: e.target.value })
        }
        sx={inputSx}
      />

      <Box>
        <Typography
          variant="caption"
          sx={{
            color: colors.TEXT_SECONDARY,
            fontWeight: 700,
            textTransform: "uppercase",
            mb: 1,
            display: "block",
          }}
        >
          Layout Width
        </Typography>
        <ToggleButtonGroup
          value={selectedField.gridWidth || "full"}
          exclusive
          onChange={(_, val: "half" | "full" | null) =>
            val && onChange({ ...selectedField, gridWidth: val })
          }
          size="small"
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              borderRadius: "0px",
              borderColor: colors.BORDER,
              color: colors.TEXT_SECONDARY,
              fontWeight: 600,
              "&.Mui-selected": {
                bgcolor: `${colors.PRIMARY}10`,
                color: colors.PRIMARY,
                borderColor: colors.PRIMARY,
                zIndex: 1,
              },
            },
          }}
        >
          <ToggleButton value="half">Half (50%)</ToggleButton>
          <ToggleButton value="full">Full (100%)</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Stack spacing={1}>
        <FormControlLabel
          control={
            <Switch
              checked={selectedField.required}
              onChange={(e) =>
                onChange({ ...selectedField, required: e.target.checked })
              }
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: colors.PRIMARY,
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  bgcolor: colors.PRIMARY,
                },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}
            >
              Required Field
            </Typography>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={selectedField.readOnly || false}
              onChange={(e) =>
                onChange({ ...selectedField, readOnly: e.target.checked })
              }
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: colors.PRIMARY,
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  bgcolor: colors.PRIMARY,
                },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}
            >
              Read Only
            </Typography>
          }
        />
      </Stack>
    </Stack>
  );
};

export default BasicFieldControls;
