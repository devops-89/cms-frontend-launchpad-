"use client";

import React from "react";
import { Box, Typography, Stack, Divider } from "@mui/material";
import { Build as BuildIcon } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";
import { FormField } from "./types";
import { buildInputSx } from "./utils";
import BasicFieldControls from "./components/BasicFieldControls";
import MinMaxConfig from "./components/MinMaxConfig";
import OptionEditor from "./components/OptionEditor";
import StylingConfig from "./components/StylingConfig";

interface FieldConfigPanelProps {
  selectedField: FormField | null;
  onChange: (updated: FormField) => void;
}

const FieldConfigPanel: React.FC<FieldConfigPanelProps> = ({
  selectedField,
  onChange,
}) => {
  const { colors } = useAppTheme();
  const inputSx = buildInputSx(colors, selectedField?.styling?.borderRadius);

  if (!selectedField) {
    return (
      <Box
        sx={{
          p: 6,
          textAlign: "center",
          opacity: 0.5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <BuildIcon sx={{ fontSize: 40, color: colors.TEXT_SECONDARY }} />
        <Typography variant="body2">Select a field to configure</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={4}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <BuildIcon sx={{ color: colors.PRIMARY, fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Configure{" "}
            {selectedField.type === "textarea"
              ? "Long Text"
              : selectedField.label}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: colors.BORDER, opacity: 0.5 }} />

        <Box>
          <Typography
            variant="caption"
            sx={{
              color: colors.PRIMARY,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 3,
              display: "block",
            }}
          >
            Basic Settings
          </Typography>
          <BasicFieldControls
            selectedField={selectedField}
            onChange={onChange}
            colors={colors}
            inputSx={inputSx}
          />
        </Box>

        <Divider sx={{ borderColor: colors.BORDER, opacity: 0.5 }} />

        <Box>
          <Typography
            variant="caption"
            sx={{
              color: colors.PRIMARY,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 3,
              display: "block",
            }}
          >
            Styling
          </Typography>
          <StylingConfig
            selectedField={selectedField}
            onChange={onChange}
            colors={colors}
          />
        </Box>

        {(selectedField.type === "text" ||
          selectedField.type === "number" ||
          selectedField.type === "textarea") && (
          <>
            <Divider sx={{ borderColor: colors.BORDER, opacity: 0.5 }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: colors.PRIMARY,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  mb: 3,
                  display: "block",
                }}
              >
                Validation Rules
              </Typography>
              <MinMaxConfig
                selectedField={selectedField}
                onChange={onChange}
                inputSx={inputSx}
              />
            </Box>
          </>
        )}

        {selectedField.type === "dropdown" && (
          <>
            <Divider sx={{ borderColor: colors.BORDER, opacity: 0.5 }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: colors.PRIMARY,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  mb: 3,
                  display: "block",
                }}
              >
                Menu Options
              </Typography>
              <OptionEditor
                selectedField={selectedField}
                onChange={onChange}
                colors={colors}
                inputSx={inputSx}
              />
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default FieldConfigPanel;
