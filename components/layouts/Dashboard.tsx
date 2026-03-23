"use client";

import React from "react";
import { Box } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useAppTheme();

  return (
    <Box>
      <Box component="main">{children}</Box>
    </Box>
  );
};

export default DashboardLayout;
