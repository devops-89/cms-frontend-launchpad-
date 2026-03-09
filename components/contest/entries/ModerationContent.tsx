"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Gavel as ModerationIcon } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

const ModerationContent: React.FC = () => {
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
      <ModerationIcon
        sx={{ fontSize: 48, color: colors.PRIMARY, opacity: 0.4 }}
      />
      <Typography
        variant="h6"
        sx={{ color: colors.TEXT_SECONDARY, fontWeight: 600 }}
      >
        Moderation Queue
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.TEXT_SECONDARY, textAlign: "center" }}
      >
        1 entry is pending moderation review.
      </Typography>
      <Button
        variant="contained"
        sx={{
          bgcolor: colors.PRIMARY,
          textTransform: "none",
          fontWeight: 600,
          "&:hover": { bgcolor: colors.PRIMARY, opacity: 0.9 },
        }}
      >
        Review Entries
      </Button>
    </Box>
  );
};

export default ModerationContent;
