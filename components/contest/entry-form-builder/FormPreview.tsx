"use client";

import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { FormField } from "./types";
import PreviewField from "./PreviewField";

interface FormPreviewProps {
  fields: FormField[];
}

const FormPreview: React.FC<FormPreviewProps> = ({ fields }) => {
  if (fields.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center", opacity: 0.5 }}>
        <Typography variant="body2">Add fields to see a preview</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Form Preview
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 0,
        }}
      >
        <Grid container spacing={3}>
          {fields.map((field) => (
            <Grid
              key={field.id}
              size={{ xs: 12, sm: field.gridWidth === "half" ? 6 : 12 }}
            >
              <PreviewField field={field} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default FormPreview;
