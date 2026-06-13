"use client";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Dashboard as DashboardIcon, Assessment as AssessmentIcon } from "@mui/icons-material";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

const JUDGE_SIDEBAR = [
  { label: "Dashboard", href: "/judge-panel/dashboard", icon: DashboardIcon },
  { label: "My Entries", href: "/judge-panel/entries", icon: AssessmentIcon },
];

const JudgeSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <Box>
      <Box
        sx={{
          width: "250px",
          height: "100vh",
          boxShadow: "0px 0px 2px 2px #d7d7d7",
          backgroundColor: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 999,
        }}
      >
        <Box sx={{ textAlign: "center", pt: 2 }}>
          <Box sx={{ borderBottom: "1px solid #d7d7d7", pb: 2 }}>
            <Typography variant="h6">Judge Platform</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <List component="nav">
              {JUDGE_SIDEBAR.map((val, i) => {
                const isSelected = pathname.startsWith(val.href);

                return (
                  <ListItemButton
                    key={i}
                    onClick={() => handleNavigate(val.href)}
                    selected={isSelected}
                    sx={{
                      borderRadius: "8px",
                      mb: 0.5,
                      "&.Mui-selected": {
                        backgroundColor: "rgba(0, 0, 0, 0.08)",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    {val.icon && (
                      <Box sx={{ mr: 2, display: "flex" }}>
                        <val.icon fontSize="small" />
                      </Box>
                    )}
                    <ListItemText
                      primary={val.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: "0.9rem",
                            fontWeight: isSelected ? 600 : 500,
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default JudgeSidebar;
