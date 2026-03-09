"use client";

import React from "react";
import { Stack, TextField } from "@mui/material";
import { FormField } from "../types";

const FIELDS_WITH_MIN_MAX: FormField["type"][] = [
  "text",
  "email",
  "password",
  "number",
  "textarea",
];

interface MinMaxConfigProps {
  selectedField: FormField;
  onChange: (updated: FormField) => void;
  inputSx: any;
}

const MinMaxConfig: React.FC<MinMaxConfigProps> = ({
  selectedField,
  onChange,
  inputSx,
}) => {
  if (!FIELDS_WITH_MIN_MAX.includes(selectedField.type)) return null;

  return (
    <Stack direction="row" spacing={2}>
      <TextField
        fullWidth
        label={selectedField.type === "number" ? "Min Value" : "Min Length"}
        type="number"
        value={selectedField.min}
        onChange={(e) => onChange({ ...selectedField, min: e.target.value })}
        sx={inputSx}
      />
      <TextField
        fullWidth
        label={selectedField.type === "number" ? "Max Value" : "Max Length"}
        type="number"
        value={selectedField.max}
        onChange={(e) => onChange({ ...selectedField, max: e.target.value })}
        sx={inputSx}
      />
    </Stack>
  );
};

export default MinMaxConfig;
