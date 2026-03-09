"use client";

import React from "react";
import { Stack, Typography, Slider, Box } from "@mui/material";
import { FormField } from "../types";

interface StylingConfigProps {
  selectedField: FormField;
  onChange: (updated: FormField) => void;
  colors: Record<string, string>;
}

const StylingConfig: React.FC<StylingConfigProps> = ({
  selectedField,
  onChange,
  colors,
}) => {
  const borderRadius = selectedField.styling?.borderRadius ?? 0;

  const handleRadiusChange = (_: Event, value: number | number[]) => {
    onChange({
      ...selectedField,
      styling: {
        ...selectedField.styling,
        borderRadius: value as number,
      },
    });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: colors.TEXT_SECONDARY,
            fontWeight: 700,
            textTransform: "uppercase",
            mb: 2,
            display: "block",
          }}
        >
          Border Radius ({borderRadius}px)
        </Typography>
        <Slider
          value={borderRadius}
          onChange={handleRadiusChange}
          min={0}
          max={24}
          step={2}
          sx={{
            color: colors.PRIMARY,
            "& .MuiSlider-thumb": {
              borderRadius: "4px",
              width: 12,
              height: 12,
            },
            "& .MuiSlider-track": {
              border: "none",
            },
            "& .MuiSlider-rail": {
              opacity: 0.1,
              bgcolor: colors.TEXT_SECONDARY,
            },
          }}
        />
      </Box>
    </Stack>
  );
};

export default StylingConfig;
