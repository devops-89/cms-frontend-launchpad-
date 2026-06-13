"use client";

import React from "react";
import { Box } from "@mui/material";

const JudgePanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box>
      <Box component="main">{children}</Box>
    </Box>
  );
};

export default JudgePanelLayout;
