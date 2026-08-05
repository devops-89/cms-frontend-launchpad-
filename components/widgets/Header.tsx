"use client";
import { AuthControllers } from "@/api/authControllers";
import { useAppTheme } from "@/context/ThemeContext";
import { LogoutOutlined, Person } from "@mui/icons-material";
import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LayoutProvider from "./Layout-Provider";
const Header = () => {
  const { colors } = useAppTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const isJudgePanel = window.location.pathname.startsWith('/judge-panel');
    const token = isJudgePanel ? sessionStorage.getItem("judge_access_token") : sessionStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    AuthControllers.getMe(token)
      .then((res) => {
        const data = res?.data?.data || res?.data;
        if (data) {
          setUser(data);
          const sessionKey = isJudgePanel ? "judge_user" : "user";
          sessionStorage.setItem(sessionKey, JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user from API, falling back to session storage", err);
        const userStr = isJudgePanel ? sessionStorage.getItem("judge_user") : sessionStorage.getItem("user");
        if (userStr) {
          try {
            setUser(JSON.parse(userStr));
          } catch (error) {
            console.error("Failed to parse user from sessionStorage", error);
          }
        }
      });
  }, []);

  const handleLogout = async () => {
    try {
      const isJudgePanel = window.location.pathname.startsWith('/judge-panel');
      const refreshToken = isJudgePanel 
        ? sessionStorage.getItem("judge_refresh_token") || "" 
        : sessionStorage.getItem("refresh_token") || "";
        
      await AuthControllers.logout({ refreshToken });
    } catch (err) {
      console.error("Logout API failed, continuing with local cleanup...", err);
    }
    
    queryClient.clear();
    const isJudgePanel = window.location.pathname.startsWith('/judge-panel');
    if (isJudgePanel) {
      sessionStorage.removeItem("judge_access_token");
      sessionStorage.removeItem("judge_refresh_token");
      sessionStorage.removeItem("judge_user");
    } else {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");
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
                src={user?.avatarDownloadUrl || user?.avatarUrl || undefined}
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
                minWidth: 160,
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
              {!(pathname === "/dashboard/profile" || pathname === "/judge-panel/profile") && (
                <Button
                  variant="text"
                  startIcon={<Person />}
                  onClick={() => {
                    setMenuOpen(false);
                    const isJudgePanel = window.location.pathname.startsWith('/judge-panel');
                    router.push(isJudgePanel ? "/judge-panel/profile" : "/dashboard/profile");
                  }}
                  sx={{
                    justifyContent: "flex-start",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    color: colors.TEXT_PRIMARY,
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  My Profile
                </Button>
              )}

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
                  whiteSpace: "nowrap",
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
