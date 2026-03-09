"use client";

import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";
import { ChevronRight as ArrowIcon } from "@mui/icons-material";
import { COLORS } from "@/utils/enum";
import { STATS } from "@/utils/constant";
import { useAppTheme } from "@/context/ThemeContext";

const ContestStats: React.FC = () => {
  const { colors, mode } = useAppTheme();
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {STATS.map((stat, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 2 }}>
          <Paper
            elevation={0}
            sx={{
              background:
                mode === "dark"
                  ? "rgba(30, 41, 59, 0.4)"
                  : "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${colors.BORDER}`,
              borderRadius: 3,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow:
                  mode === "dark"
                    ? "0 12px 24px rgba(0,0,0,0.3)"
                    : "0 8px 16px rgba(0,0,0,0.08)",
                borderColor: colors.PRIMARY,
              },
            }}
          >
            <Box
              sx={{
                p: 2,
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: stat.color,
                  opacity: 0.1,
                  position: "absolute",
                  left: 16,
                  zIndex: 0,
                }}
              />
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  color: colors.ACCENT,
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.8,
                  ml: 1,
                }}
              >
                {stat.icon}
              </Box>
              <Box sx={{ ml: "auto", textAlign: "right" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1,
                    color: colors.TEXT_PRIMARY,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.TEXT_SECONDARY,
                    fontSize: "0.7rem",
                    mt: 0.5,
                    display: "block",
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                px: 1.5,
                py: 1,
                bgcolor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.02)",
                borderTop: `1px solid ${colors.BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                "&:hover": {
                  bgcolor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.04)",
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: colors.TEXT_PRIMARY,
                  fontSize: "0.65rem",
                }}
              >
                {stat.subtitle}
              </Typography>
              <ArrowIcon sx={{ fontSize: 12, color: colors.TEXT_SECONDARY }} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ContestStats;
