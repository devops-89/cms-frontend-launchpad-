"use client";
import { AuthControllers } from "@/api/authControllers";
import { useAppTheme } from "@/context/ThemeContext";
import { LogoutOutlined, Person } from "@mui/icons-material";
import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LayoutProvider from "./Layout-Provider";
const Header = () => {
  const { colors } = useAppTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const isJudgePanel = window.location.pathname.startsWith('/judge-panel');
    const token = isJudgePanel ? localStorage.getItem("judge_access_token") : localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const userStr = isJudgePanel ? localStorage.getItem("judge_user") : localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const isJudgePanel = window.location.pathname.startsWith('/judge-panel');
      const refreshToken = isJudgePanel 
        ? localStorage.getItem("judge_refresh_token") || "" 
        : localStorage.getItem("refresh_token") || "";
        
      await AuthControllers.logout({ refreshToken });
    } catch (err) {
      console.error("Logout API failed, continuing with local cleanup...", err);
    }
    
    queryClient.clear();
    const isJudgePanel = window.location.pathname.startsWith('/judge-panel');
    if (isJudgePanel) {
      localStorage.removeItem("judge_access_token");
      localStorage.removeItem("judge_refresh_token");
      localStorage.removeItem("judge_user");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
    router.push("/");
  };

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
        {/* <Tooltip title="Settings">
          <IconButton
            size="small"
            sx={{
              color: colors.TEXT_SECONDARY,
              "&:hover": { color: colors.TEXT_PRIMARY, bgcolor: colors.BORDER },
            }}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip> */}

        {/* Profile Avatar with gradient ring and hover menu */}
        <Box
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
          sx={{ position: "relative", py: 1 }}
        >
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
                transition: "opacity 0.2s ease",
              }}
            >
              <Avatar
                src={user?.avatarUrl || undefined}
                sx={{
                  width: 34,
                  height: 34,
                  border: `2px solid ${colors.BACKGROUND}`,
                }}
              >
                <Person />
              </Avatar>
            </Box>

          {/* Hover Menu */}
          <Box
            sx={{
              position: "absolute",
              top: "100%",
              right: 0,
              pt: 0.5, // gap
              opacity: menuOpen ? 1 : 0,
              visibility: menuOpen ? "visible" : "hidden",
              transform: menuOpen ? "translateY(0)" : "translateY(-10px)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 1100,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                minWidth: 100,
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                bgcolor: `${colors.BACKGROUND}e6`,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: `1px solid ${colors.BORDER}`,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>
                    {user?.role?.toUpperCase() === "JUDGE" ? "Judge" : (user?.roleEntity?.name || "Admin")}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="text"
                color="error"
                startIcon={<LogoutOutlined />}
                onClick={handleLogout}
                sx={{
                  justifyContent: "flex-start",
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  color: "#ef4444",
                  "&:hover": {
                    bgcolor: "rgba(239, 68, 68, 0.08)",
                  },
                }}
              >
                Logout
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </LayoutProvider>
  );
};

export default Header;
