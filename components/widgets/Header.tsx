"use client";
import React, { useState, useEffect } from "react";
import LayoutProvider from "./Layout-Provider";
import { Avatar, Box, IconButton, Tooltip } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

const Header = () => {
  const { colors } = useAppTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <LayoutProvider>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 2,
          position: "fixed",
          top: 0,
          right: 0,
          left: 250,
          zIndex: 1000,
          height: 65,
          px: 3,
          transition:
            "background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease",
          ...(scrolled
            ? {
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                bgcolor: `${colors.BACKGROUND}cc`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                borderBottom: `1px solid ${colors.BORDER}`,
              }
            : {
                bgcolor: colors.BACKGROUND,
                borderBottom: `1px solid ${colors.BORDER}`,
              }),
        }}
      >
        {/* Settings Icon */}
        <Tooltip title="Settings">
          <IconButton
            size="small"
            sx={{
              color: colors.TEXT_SECONDARY,
              "&:hover": { color: colors.TEXT_PRIMARY, bgcolor: colors.BORDER },
            }}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Profile Avatar with gradient ring */}
        <Tooltip title="My Profile">
          <Box
            sx={{
              p: "2px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f06, #a855f7, #3b82f6)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { opacity: 0.9 },
            }}
          >
            <Avatar
              src="https://i.pravatar.cc/150?u=admin"
              sx={{
                width: 34,
                height: 34,
                border: `2px solid ${colors.BACKGROUND}`,
              }}
            />
          </Box>
        </Tooltip>
      </Box>
    </LayoutProvider>
  );
};

export default Header;
