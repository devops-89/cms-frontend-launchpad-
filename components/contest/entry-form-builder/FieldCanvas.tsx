"use client";

import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";
import { FormField } from "./types";
import FieldCanvasItem from "./FieldCanvasItem";

interface FieldCanvasProps {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
}

const FieldCanvas: React.FC<FieldCanvasProps> = ({
  fields,
  selectedId,
  onSelect,
  onMove,
  onRemove,
}) => {
  const { colors } = useAppTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${colors.BORDER}`,
        borderRadius: 3,
        p: 3,
        minHeight: 420,
        bgcolor: colors.SURFACE,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: colors.TEXT_SECONDARY,
          fontWeight: 700,
          mb: 2,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: "0.7rem",
        }}
      >
        Form Fields ({fields.length})
      </Typography>

      {fields.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            gap: 1.5,
            opacity: 0.45,
          }}
        >
          <AddIcon sx={{ fontSize: 48, color: colors.TEXT_SECONDARY }} />
          <Typography
            variant="body2"
            sx={{ color: colors.TEXT_SECONDARY, textAlign: "center" }}
          >
            Click a field type from the left to add it to your form
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {fields.map((field, idx) => (
            <Grid
              key={field.id}
              size={{ xs: 12, sm: field.gridWidth === "half" ? 6 : 12 }}
            >
              <FieldCanvasItem
                field={field}
                index={idx}
                totalCount={fields.length}
                isSelected={selectedId === field.id}
                onSelect={() =>
                  onSelect(selectedId === field.id ? null : field.id)
                }
                onMove={(dir) => onMove(field.id, dir)}
                onRemove={() => onRemove(field.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default FieldCanvas;
