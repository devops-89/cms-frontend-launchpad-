"use client";

import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { CheckCircle as SuccessIcon } from "@mui/icons-material";

interface ReviewStepProps {
  formData: any;
  onBack: () => void;
  colors: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  onBack,
  colors,
}) => {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <SuccessIcon sx={{ fontSize: 80, color: colors.ACCENT, mb: 3 }} />
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Almost Done!
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
      >
        Please review all your details for{" "}
        <b>"{formData.innovationTitle || "Untitled Innovation"}"</b> before
        final submission.
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            borderRadius: 0,
          }}
        >
          Back to Edit
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: colors.PRIMARY,
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            borderRadius: 0,
            "&:hover": { bgcolor: colors.PRIMARY, opacity: 0.9 },
          }}
        >
          Submit Entry
        </Button>
      </Stack>
    </Box>
  );
};

export default ReviewStep;
