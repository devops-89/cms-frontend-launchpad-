"use client";

import React from "react";
import { Tabs, Tab, Paper } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";

interface ContestTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const ContestTabs: React.FC<ContestTabsProps> = ({ value, onChange }) => {
  const { colors } = useAppTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: colors.SURFACE,
        borderBottom: `1px solid ${colors.BORDER}`,
        mb: 4,
        borderRadius: 0,
        mt: 2,
        backdropFilter: "blur(10px)",
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        sx={{
          px: 4,
          "& .MuiTab-root": {
            color: colors.TEXT_SECONDARY,
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 500,
            minWidth: 100,
            py: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              color: colors.PRIMARY,
              opacity: 0.8,
            },
          },
          "& .Mui-selected": {
            color: `${colors.PRIMARY} !important`,
            fontWeight: 600,
          },
          "& .MuiTabs-indicator": {
            bgcolor: colors.PRIMARY,
            height: 3,
            boxShadow: "none",
          },
        }}
      >
        <Tab label="Overview" />
        <Tab label="Entries" />
        <Tab label="Category" />
        <Tab label="Settings" />
        <Tab label="Votes" />
        <Tab label="Notifications" />
        <Tab label="Transactions" />
      </Tabs>
    </Paper>
  );
};

export default ContestTabs;
