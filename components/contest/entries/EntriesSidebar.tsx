"use client";

import React from "react";
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Gavel as ModerationIcon,
  EmojiEvents as WinnerIcon,
  Download as DownloadIcon,
  Delete as TrashIcon,
  ListAlt as EntriesIcon,
} from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

export type SubSection =
  | "entries"
  | "add-entry"
  | "moderation"
  | "winner"
  | "download"
  | "trash";

interface NavItem {
  id: SubSection;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "entries",
    label: "Entries",
    icon: <EntriesIcon fontSize="small" />,
    count: 43,
  },
  { id: "add-entry", label: "Add Entry", icon: <AddIcon fontSize="small" /> },
  {
    id: "moderation",
    label: "Moderation",
    icon: <ModerationIcon fontSize="small" />,
    count: 1,
  },
  { id: "winner", label: "Winner", icon: <WinnerIcon fontSize="small" /> },
  {
    id: "download",
    label: "Download Entries",
    icon: <DownloadIcon fontSize="small" />,
  },
  { id: "trash", label: "Trash", icon: <TrashIcon fontSize="small" /> },
];

interface EntriesSidebarProps {
  activeSection: SubSection;
  onNavClick: (id: SubSection) => void;
}

const EntriesSidebar: React.FC<EntriesSidebarProps> = ({
  activeSection,
  onNavClick,
}) => {
  const { colors } = useAppTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        width: 200,
        flexShrink: 0,
        border: `1px solid ${colors.BORDER}`,
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: colors.SURFACE,
      }}
    >
      <List disablePadding>
        {NAV_ITEMS.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItemButton
              selected={activeSection === item.id}
              onClick={() => onNavClick(item.id)}
              sx={{
                py: 1.5,
                px: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.15s ease",
                "&.Mui-selected": {
                  bgcolor: colors.PRIMARY,
                  color: "white",
                  "& .MuiListItemText-primary": {
                    color: "white",
                    fontWeight: 700,
                  },
                  "& .MuiSvgIcon-root": { color: "white" },
                },
                "&.Mui-selected:hover": {
                  bgcolor: colors.PRIMARY,
                  opacity: 0.95,
                },
                "&:hover:not(.Mui-selected)": {
                  bgcolor: `${colors.PRIMARY}0d`,
                  color: colors.PRIMARY,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box
                  sx={{
                    color:
                      activeSection === item.id
                        ? "white"
                        : colors.TEXT_SECONDARY,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                </Box>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: activeSection === item.id ? 700 : 500,
                    color:
                      activeSection === item.id ? "white" : colors.TEXT_PRIMARY,
                  }}
                />
              </Box>
              {item.count !== undefined && (
                <Chip
                  label={item.count}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    bgcolor:
                      activeSection === item.id
                        ? "rgba(255,255,255,0.25)"
                        : colors.PRIMARY,
                    color: "white",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              )}
            </ListItemButton>
            {index < NAV_ITEMS.length - 1 && (
              <Divider sx={{ borderColor: colors.BORDER }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default EntriesSidebar;
