"use client";

import React from "react";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Autocomplete,
  Box,
} from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import { FormField } from "./types";
import { COUNTRIES } from "./constants";
import { buildInputSx } from "./utils";

interface PreviewFieldProps {
  field: FormField;
}

/**
 * Renders a read-only preview of a single form field.
 * - dropdown → MUI Autocomplete (searchable options list)
 * - country  → MUI Autocomplete (searchable country list)
 * - checkbox → Switch + label
 * - all else → TextField
 */
const PreviewField: React.FC<PreviewFieldProps> = ({ field }) => {
  const { colors } = useAppTheme();
  const inputSx = buildInputSx(colors, field.styling?.borderRadius);
  const labelWithRequired = field.label + (field.required ? " *" : "");

  switch (field.type) {
    case "dropdown": {
      const options = (field.options ?? []).map((o) => o.label).filter(Boolean);
      return (
        <Autocomplete
          options={options}
          readOnly={field.readOnly}
          defaultValue={field.defaultValue}
          renderInput={(params) => (
            <TextField
              {...params}
              label={labelWithRequired}
              placeholder={field.placeholder || "Search or select…"}
              helperText={field.helperText}
              size="small"
              sx={inputSx}
            />
          )}
        />
      );
    }

    case "country":
      return (
        <Autocomplete
          options={COUNTRIES}
          readOnly={field.readOnly}
          defaultValue={field.defaultValue}
          renderInput={(params) => (
            <TextField
              {...params}
              label={labelWithRequired}
              placeholder="Search country…"
              helperText={field.helperText}
              size="small"
              sx={inputSx}
            />
          )}
        />
      );

    case "textarea":
      return (
        <TextField
          fullWidth
          multiline
          rows={3}
          label={labelWithRequired}
          placeholder={field.placeholder}
          helperText={field.helperText}
          defaultValue={field.defaultValue}
          InputProps={{ readOnly: field.readOnly }}
          size="small"
          sx={inputSx}
        />
      );

    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={field.defaultValue === "true"}
              disabled={field.readOnly}
              sx={{
                color: colors.BORDER,
                "&.Mui-checked": {
                  color: colors.PRIMARY,
                },
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY }}>
                {labelWithRequired}
              </Typography>
              {field.helperText && (
                <Typography
                  variant="caption"
                  sx={{ color: colors.TEXT_SECONDARY, display: "block" }}
                >
                  {field.helperText}
                </Typography>
              )}
            </Box>
          }
        />
      );

    default:
      return (
        <TextField
          fullWidth
          label={labelWithRequired}
          placeholder={field.placeholder}
          helperText={field.helperText}
          defaultValue={field.defaultValue}
          InputProps={{ readOnly: field.readOnly }}
          type={field.type}
          size="small"
          sx={inputSx}
        />
      );
  }
};

export default PreviewField;
