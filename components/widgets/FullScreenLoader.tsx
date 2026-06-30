import React from "react";
import { Box, CircularProgress, Typography, Backdrop } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";

interface FullScreenLoaderProps {
  open: boolean;
  message?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ open, message = "Loading..." }) => {
  const { colors } = useAppTheme();

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 999,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
      }}
      open={open}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: colors.PRIMARY,
            animationDuration: "1000ms",
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Subtle inner circle for aesthetic */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: `${colors.PRIMARY}20`,
            }}
          />
        </Box>
      </Box>
      {message && (
        <Typography
          variant="h6"
          sx={{
            color: colors.TEXT_PRIMARY,
            fontWeight: 600,
            letterSpacing: 1,
            mt: 1,
          }}
        >
          {message}
        </Typography>
      )}
    </Backdrop>
  );
};

export default FullScreenLoader;
