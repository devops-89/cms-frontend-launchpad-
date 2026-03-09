"use client";

import React from "react";
import { Stack, Tooltip, IconButton } from "@mui/material";
import {
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";

interface FieldCanvasItemActionsProps {
  index: number;
  totalCount: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  colors: Record<string, string>;
}

const FieldCanvasItemActions: React.FC<FieldCanvasItemActionsProps> = ({
  index,
  totalCount,
  onMove,
  onRemove,
  colors,
}) => {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      flexShrink={0}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip title="Move Up">
        <span>
          <IconButton
            size="small"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            sx={{ color: colors.TEXT_SECONDARY }}
          >
            <MoveUpIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Move Down">
        <span>
          <IconButton
            size="small"
            disabled={index === totalCount - 1}
            onClick={() => onMove(1)}
            sx={{ color: colors.TEXT_SECONDARY }}
          >
            <MoveDownIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Remove Field">
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            color: colors.TEXT_SECONDARY,
            "&:hover": { color: colors.ERROR },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default FieldCanvasItemActions;
