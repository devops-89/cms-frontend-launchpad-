"use client";

import React from "react";
import { Box, Typography, Stack, Tooltip } from "@mui/material";
import { Paper } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import { FieldType } from "./types";
import { FIELD_PALETTE } from "./constants";

interface FieldPalettePanelProps {
  onAddField: (type: FieldType) => void;
}

const FieldPalettePanel: React.FC<FieldPalettePanelProps> = ({
  onAddField,
}) => {
  const { colors } = useAppTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${colors.BORDER}`,
        borderRadius: 3,
        p: 2,
        bgcolor: colors.SURFACE,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: colors.TEXT_SECONDARY,
          fontWeight: 800,
          mb: 3,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.75rem",
        }}
      >
        Field Types
      </Typography>

      <Stack spacing={2}>
        {FIELD_PALETTE.map((item) => (
          <Tooltip
            key={item.type}
            title={item.description}
            placement="right"
            arrow
          >
            <Box
              role="button"
              tabIndex={0}
              onClick={() => onAddField(item.type)}
              onKeyDown={(e) => e.key === "Enter" && onAddField(item.type)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: `1px solid ${colors.BORDER}`,
                borderRadius: "12px",
                p: "20px",
                bgcolor: colors.SURFACE,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  borderColor: colors.PRIMARY,
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px ${colors.PRIMARY}15`,
                },
              }}
            >
              <Box
                sx={{
                  color: colors.PRIMARY,
                  display: "flex",
                  alignItems: "center",
                  "& svg": { fontSize: "28px" },
                }}
              >
                {item.icon}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: colors.TEXT_PRIMARY,
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {item.label}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Stack>
    </Paper>
  );
};

export default FieldPalettePanel;
