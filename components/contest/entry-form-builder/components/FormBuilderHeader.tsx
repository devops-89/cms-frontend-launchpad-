"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  TextField,
} from "@mui/material";
import {
  Visibility as PreviewIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

interface FormBuilderHeaderProps {
  isPreview: boolean;
  setIsPreview: (val: boolean | ((prev: boolean) => boolean)) => void;
  formName: string;
  setFormName: (val: string) => void;
  onSave: () => void;
  fieldsCount: number;
  saved: boolean;
  onCloseAlert: () => void;
}

const FormBuilderHeader: React.FC<FormBuilderHeaderProps> = ({
  isPreview,
  setIsPreview,
  formName,
  setFormName,
  onSave,
  fieldsCount,
  saved,
  onCloseAlert,
}) => {
  const { colors } = useAppTheme();

  return (
    <Box mb={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: colors.TEXT_PRIMARY,
              letterSpacing: "-0.5px",
            }}
          >
            Entry Form Builder
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.TEXT_SECONDARY, mt: 0.5, mb: 2 }}
          >
            Add fields from the palette and configure how they appear in your
            entry form.
          </Typography>
          {!isPreview && (
            <TextField
              size="small"
              placeholder="Enter Form Name (e.g. Innovation Contest 2024)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              sx={{
                width: "400px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "white",
                },
              }}
              label="Enter Form Name"
            />
          )}
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setIsPreview((v) => !v)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: isPreview ? colors.PRIMARY : colors.TEXT_SECONDARY,
              borderColor: isPreview ? colors.PRIMARY : colors.BORDER,
              "&:hover": {
                borderColor: colors.PRIMARY,
                color: colors.PRIMARY,
                bgcolor: `${colors.PRIMARY}08`,
              },
            }}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={fieldsCount === 0}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: colors.PRIMARY,
              "&:hover": { bgcolor: colors.PRIMARY, opacity: 0.9 },
              "&:disabled": { opacity: 0.4 },
            }}
          >
            Save Form
          </Button>
        </Stack>
      </Stack>

      {/* Save success banner */}
      {saved && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={onCloseAlert}
        >
          Entry form saved successfully!
        </Alert>
      )}
    </Box>
  );
};

export default FormBuilderHeader;
