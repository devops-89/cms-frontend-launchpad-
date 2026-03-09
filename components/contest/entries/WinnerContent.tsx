"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { EmojiEvents as WinnerIcon } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

const WinnerContent: React.FC = () => {
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
      <WinnerIcon sx={{ fontSize: 48, color: "#f59e0b", opacity: 0.7 }} />
      <Typography
        variant="h6"
        sx={{ color: colors.TEXT_SECONDARY, fontWeight: 600 }}
      >
        Select a Winner
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.TEXT_SECONDARY, textAlign: "center" }}
      >
        No winner has been selected yet. Review entries and select the top
        submission.
      </Typography>
    </Box>
  );
};

export default WinnerContent;
