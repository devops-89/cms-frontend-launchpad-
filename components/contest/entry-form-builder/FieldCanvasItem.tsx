"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";
import { FormField } from "./types";
import { FIELD_PALETTE } from "./constants";
import FieldCanvasItemActions from "./components/FieldCanvasItemActions";

interface FieldCanvasItemProps {
  field: FormField;
  index: number;
  totalCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

const FieldCanvasItem: React.FC<FieldCanvasItemProps> = ({
  field,
  index,
  totalCount,
  isSelected,
  onSelect,
  onMove,
  onRemove,
}) => {
  const { colors } = useAppTheme();
  const palette = FIELD_PALETTE.find((p) => p.type === field.type)!;

  return (
    <Box
      onClick={onSelect}
      sx={{
        border: `2px solid ${isSelected ? colors.PRIMARY : colors.BORDER}`,
        borderRadius: 3,
        p: 2,
        bgcolor: isSelected ? `${colors.PRIMARY}08` : colors.SURFACE,
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          borderColor: colors.PRIMARY,
          boxShadow: isSelected ? "none" : `0 4px 12px ${colors.PRIMARY}10`,
        },
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Drag handle (visual only) */}
      <DragIcon sx={{ color: colors.BORDER, cursor: "grab", flexShrink: 0 }} />

      {/* Field type icon */}
      <Box
        sx={{
          color: isSelected ? colors.PRIMARY : colors.TEXT_SECONDARY,
          display: "flex",
          flexShrink: 0,
        }}
      >
        {palette.icon}
      </Box>

      {/* Label + meta */}
      <Box flex={1} minWidth={0}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: colors.TEXT_PRIMARY,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {field.label}
          {field.required && (
            <Chip
              label="Required"
              size="small"
              sx={{
                height: 16,
                fontSize: "0.65rem",
                bgcolor: `${colors.ERROR}15`,
                color: colors.ERROR,
              }}
            />
          )}
        </Typography>
        <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY }}>
          {palette.label}
          {field.type === "dropdown" &&
            ` · ${field.options?.length ?? 0} options`}
          {field.min && ` · Min: ${field.min}`}
          {field.max && ` · Max: ${field.max}`}
        </Typography>
      </Box>

      {/* Actions – stop propagation so clicking buttons doesn't also select the card */}
      <FieldCanvasItemActions
        index={index}
        totalCount={totalCount}
        onMove={onMove}
        onRemove={onRemove}
        colors={colors}
      />
    </Box>
  );
};

export default FieldCanvasItem;
