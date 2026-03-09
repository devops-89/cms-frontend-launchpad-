"use client";

import React from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

const Login = () => {
  const { colors, mode } = useAppTheme();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: colors.TEXT_PRIMARY,
      "& fieldset": { borderColor: colors.BORDER },
      "&:hover fieldset": { borderColor: colors.PRIMARY },
      "&.Mui-focused fieldset": { borderColor: colors.PRIMARY },
    },
    "& .MuiInputLabel-root": { color: colors.TEXT_SECONDARY },
    "& .MuiInputLabel-root.Mui-focused": { color: colors.PRIMARY },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`,
        padding: 2,
        transition: "background 0.3s ease",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 4, md: 6 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${colors.BORDER}`,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                color: colors.TEXT_PRIMARY,
                letterSpacing: "-0.025em",
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY }}>
              Enter your credentials to access your account
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              variant="outlined"
              sx={textFieldStyles}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              sx={textFieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: colors.TEXT_SECONDARY }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
                mb: 2,
              }}
            >
              <Link
                href="#"
                variant="body2"
                sx={{
                  color: colors.PRIMARY,
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                bgcolor: colors.PRIMARY,
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: colors.PRIMARY,
                  opacity: 0.9,
                  transform: "translateY(-1px)",
                  boxShadow: `0 10px 15px -3px ${colors.PRIMARY}40`,
                },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
