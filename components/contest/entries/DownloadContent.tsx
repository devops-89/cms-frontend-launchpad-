"use client";

import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

const DownloadContent: React.FC = () => {
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
      <DownloadIcon
        sx={{ fontSize: 48, color: colors.PRIMARY, opacity: 0.5 }}
      />
      <Typography
        variant="h6"
        sx={{ color: colors.TEXT_SECONDARY, fontWeight: 600 }}
      >
        Download Entries
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.TEXT_SECONDARY, textAlign: "center" }}
      >
        Export all entries for this contest as a CSV or ZIP file.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          sx={{
            color: colors.PRIMARY,
            borderColor: colors.PRIMARY,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: `${colors.PRIMARY}10` },
          }}
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: colors.PRIMARY,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: colors.PRIMARY, opacity: 0.9 },
          }}
        >
          Download ZIP
        </Button>
      </Stack>
    </Box>
  );
};

export default DownloadContent;
