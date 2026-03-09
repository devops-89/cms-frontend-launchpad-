"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import {
  DeleteOutline as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { FormField } from "../types";
import { uid } from "../utils";

interface OptionEditorProps {
  selectedField: FormField;
  onChange: (updated: FormField) => void;
  colors: Record<string, string>;
  inputSx: any;
}

const OptionEditor: React.FC<OptionEditorProps> = ({
  selectedField,
  onChange,
  colors,
  inputSx,
}) => {
  if (selectedField.type !== "dropdown" || !selectedField.options) return null;

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ color: colors.TEXT_SECONDARY, mb: 1, fontWeight: 600 }}
      >
        Options
      </Typography>
      <Stack spacing={1}>
        {selectedField.options.map((opt, idx) => (
          <Stack key={opt.id} direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              size="small"
              value={opt.label}
              placeholder={`Option ${idx + 1}`}
              onChange={(e) => {
                const updated = [...selectedField.options!];
                updated[idx] = { ...opt, label: e.target.value };
                onChange({ ...selectedField, options: updated });
              }}
              sx={inputSx}
            />
            <IconButton
              size="small"
              onClick={() =>
                onChange({
                  ...selectedField,
                  options: selectedField.options!.filter(
                    (o) => o.id !== opt.id,
                  ),
                })
              }
              sx={{ color: colors.ERROR, flexShrink: 0 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            onChange({
              ...selectedField,
              options: [
                ...(selectedField.options ?? []),
                { id: uid(), label: "" },
              ],
            })
          }
          sx={{
            textTransform: "none",
            color: colors.PRIMARY,
            alignSelf: "flex-start",
            fontWeight: 600,
          }}
        >
          Add Option
        </Button>
      </Stack>
    </Box>
  );
};

export default OptionEditor;
