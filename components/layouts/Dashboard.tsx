"use client";

import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  EmojiEvents as ContestIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Visibility as ViewIcon,
  Menu as MenuIcon,
  ExitToApp,
  Build as BuildIcon,
  Group as PeopleIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

const DRAWER_WIDTH = 280;

import { useAppTheme } from "@/context/ThemeContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { mode, colors } = useAppTheme();
  const [openContest, setOpenContest] = React.useState(false);
  const router = useRouter();

  const handleContestClick = () => {
    setOpenContest(!openContest);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "User Management",
      icon: <PeopleIcon />,
      path: "/dashboard/users",
    },
    {
      text: "Contest Management",
      icon: <ContestIcon />,
      subItems: [
        {
          text: "Create Contest",
          icon: <AddIcon />,
          path: "/dashboard/create-contest",
        },
        {
          text: "View Contest",
          icon: <ViewIcon />,
          path: "/dashboard/view-contest",
        },
        {
          text: "Form Builder",
          icon: <BuildIcon />,
          path: "/dashboard/form-builder",
        },
      ],
    },
  ];

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", bgcolor: colors.BACKGROUND }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            borderRight: `1px solid ${colors.BORDER}`,
            color: colors.TEXT_PRIMARY,
            boxShadow: "5px 0 20px rgba(0,0,0,0.05)",
          },
        }}
      >
        <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: colors.PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ContestIcon sx={{ color: "white" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: "-0.5px" }}
          >
            CMS Launchpad
          </Typography>
        </Box>

        <List sx={{ px: 2, mt: 2 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={
                    item.subItems
                      ? handleContestClick
                      : () => router.push(item.path || "#")
                  }
                  sx={{
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.03)",
                      color: colors.PRIMARY,
                      "& .MuiListItemIcon-root": { color: colors.PRIMARY },
                    },
                    color:
                      item.subItems && openContest
                        ? colors.PRIMARY
                        : colors.TEXT_SECONDARY,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        item.subItems && openContest
                          ? colors.PRIMARY
                          : colors.TEXT_SECONDARY,
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: "0.95rem",
                    }}
                  />
                  {item.subItems ? (
                    openContest ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )
                  ) : null}
                </ListItemButton>
              </ListItem>

              {item.subItems && (
                <Collapse in={openContest} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {item.subItems.map((subItem) => (
                      <ListItem
                        key={subItem.text}
                        disablePadding
                        sx={{ mb: 0.5 }}
                      >
                        <ListItemButton
                          onClick={() => router.push(subItem.path)}
                          sx={{
                            borderRadius: 2,
                            "&:hover": {
                              bgcolor: "rgba(99, 102, 241, 0.08)",
                              color: colors.PRIMARY,
                              "& .MuiListItemIcon-root": {
                                color: colors.PRIMARY,
                              },
                            },
                            color: colors.TEXT_SECONDARY,
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <ListItemIcon
                            sx={{ color: colors.TEXT_SECONDARY, minWidth: 32 }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{ fontSize: "0.85rem" }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: "auto", p: 2, borderTop: `1px solid ${colors.BORDER}` }}>
          <ListItem disablePadding>
            <ListItemButton
              sx={{ borderRadius: 2, color: colors.ERROR }}
              onClick={() => router.push("/")}
            >
              <ListItemIcon sx={{ color: colors.ERROR, minWidth: 40 }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, px: 2 }}
          >
            <Avatar
              sx={{
                bgcolor: colors.SECONDARY,
                width: 32,
                height: 32,
                fontSize: "0.8rem",
              }}
            >
              AD
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}
              >
                Admin User
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: colors.TEXT_SECONDARY }}
              >
                admin@cms.com
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 4, height: "100vh", overflow: "auto" }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
