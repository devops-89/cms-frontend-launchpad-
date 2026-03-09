"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { Delete as TrashIcon } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

const TrashContent: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        flexDirection: "column",
        gap: 2,
      }}
    >
      <TrashIcon sx={{ fontSize: 48, color: colors.ERROR, opacity: 0.5 }} />
      <Typography
        variant="h6"
        sx={{ color: colors.TEXT_SECONDARY, fontWeight: 600 }}
      >
        Trash
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.TEXT_SECONDARY, textAlign: "center" }}
      >
        No entries in the trash. Deleted entries will appear here.
      </Typography>
    </Box>
  );
};

export default TrashContent;
