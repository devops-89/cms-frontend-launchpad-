"use client";
import { SIDEBAR } from "@/utils/constant";
import {
  Box,
  Collapse,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/context/PermissionContext";

const Sidebar = () => {
  const router = useRouter();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleToggleSubMenu = (label: string) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const { hasPermission, isLoading, isAdmin } = usePermissions();

  const filteredSidebar = SIDEBAR.map((val) => {
    if (!val || Object.keys(val).length === 0 || !val.label) return null;

    if (val.label === "Permission Management" && !isAdmin) return null;
    if (val.label === "Dashboard" && !isAdmin) return null;

    if (val.subModules && val.subModules.length > 0) {
      // Filter submodules based on their own permissions
      const filteredSubModules = val.subModules.filter((sub) => hasPermission(sub.label, "canView"));
      
      // If no submodules are permitted, hide the parent
      if (filteredSubModules.length === 0) return null;
      
      // Return parent with filtered submodules
      return { ...val, subModules: filteredSubModules };
    }

    // For items without submodules, check the parent's permission
    const canViewParent = hasPermission(val.label, "canView");
    return canViewParent ? val : null;
  }).filter(Boolean);

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
            <Typography variant="h6">Ignite Innovation</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
            <List component="nav">
              {filteredSidebar.map((val: any, i: number) => {
                if (!val || Object.keys(val).length === 0) return null;

                const hasSubModules =
                  val.subModules && val.subModules.length > 0;
                const isOpen = openSubMenu === val.label;

                return (
                  <React.Fragment key={i}>
                    <ListItemButton
                      onClick={
                        hasSubModules
                          ? () => handleToggleSubMenu(val.label)
                          : () => val.href && handleNavigate(val.href)
                      }
                      sx={{
                        borderRadius: "8px",
                        mb: 0.5,
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
                              fontWeight: hasSubModules ? 600 : 500,
                            },
                          },
                        }}
                      />
                      {hasSubModules &&
                        (isOpen ? (
                          <ExpandLess fontSize="small" />
                        ) : (
                          <ExpandMore fontSize="small" />
                        ))}
                    </ListItemButton>

                    {hasSubModules && (
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {val.subModules.map((sub: any, j: number) => (
                            <ListItemButton
                              key={j}
                              onClick={() => handleNavigate(sub.href)}
                              sx={{
                                pl: 4,
                                borderRadius: "8px",
                                mb: 0.5,
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                                },
                              }}
                            >
                              <ListItemAvatar sx={{ minWidth: 20 }}>
                                {sub.icon && (
                                  <Box sx={{ mr: 2, display: "flex" }}>
                                    <sub.icon fontSize="small" />
                                  </Box>
                                )}
                              </ListItemAvatar>
                              <ListItemText
                                primary={sub.label}
                                slotProps={{}}
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </React.Fragment>
                );
                })}
              </List>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
