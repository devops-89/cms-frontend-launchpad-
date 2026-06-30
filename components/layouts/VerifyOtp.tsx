"use client";

import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Collapse,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import * as Yup from "yup";

import { AuthControllers } from "@/api/authControllers";
import { useAppTheme } from "@/context/ThemeContext";
import { Suspense } from "react";
import { useSnackbar } from "@/context/SnackbarContext";

const VerifyOtpForm = () => {
  const { colors } = useAppTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow");
  const emailParam = searchParams.get("email");

  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = React.useState(false);
  const [timer, setTimer] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResendOtp = async () => {
    try {
      const email = emailParam || localStorage.getItem("resetEmail");
      if (!email) {
        showSnackbar("Email not found. Please try again.", "error");
        return;
      }
      
      setLoading(true);
      await AuthControllers.resendOtp({ email });
      showSnackbar("OTP resent successfully", "success");
      setTimer(60);
      setCanResend(false);
    } catch (error: any) {
      showSnackbar(
        error?.response?.data?.message || "Failed to resend OTP",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },

    validationSchema: flow === "forgot" ? Yup.object({
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Password must include at least one uppercase letter")
        .matches(/[a-z]/, "Password must include at least one lowercase letter")
        .matches(/[0-9]/, "Password must include at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must include at least one special character",
        )
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
    }) : Yup.object({}),

    onSubmit: async (values) => {
      try {
        setLoading(true);

        const finalOtp = otp.join("");

        if (finalOtp.length !== 6) {
          showSnackbar("Enter complete OTP", "error");
          setLoading(false);
          return;
        }

        const email = emailParam || localStorage.getItem("resetEmail");

        if (flow === "forgot") {
          const response = await AuthControllers.resetPassword({
            email: email || "",
            otp: finalOtp,
            password: values.password,
          });

          showSnackbar(
            response?.data?.message || "Password reset successfully!",
            "success"
          );

          setTimeout(() => {
            router.push("/");
          }, 1000);
          return;
        }

        const response = await AuthControllers.verifyOtp({ otp: finalOtp });

        showSnackbar(
          response?.data?.message || "OTP verified successfully",
          "success"
        );

        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error: any) {
        showSnackbar(
          error?.response?.data?.message || "Invalid OTP",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value.slice(-1);
    setOtp(updatedOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", p: 2 }}>
      <Container maxWidth="sm">
        <form onSubmit={formik.handleSubmit}>
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", border: `1px solid ${colors.BORDER}`, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
                {flow === "forgot" ? "Reset Password" : "Verify OTP"}
              </Typography>
              <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY, mt: 1 }}>
                Enter 6 digit OTP
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 4 }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  value={digit}
                  inputRef={(el) => { inputRefs.current[index] = el; }}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  inputProps={{ maxLength: 1 }}
                  sx={{
                    width: { xs: "40px", sm: "50px" },
                    "& .MuiOutlinedInput-root": {
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      borderRadius: 2,
                      color: colors.PRIMARY,
                      "& fieldset": { borderColor: colors.BORDER },
                      "&:hover fieldset": { borderColor: colors.PRIMARY },
                      "&.Mui-focused fieldset": { borderColor: colors.PRIMARY, borderWidth: "2px" },
                    },
                    "& input": {
                      textAlign: "center",
                      p: { xs: 1.5, sm: 2 },
                    }
                  }}
                />
              ))}
            </Box>

            {flow === "forgot" && (
              <Box sx={{ mt: 4 }}>
                <TextField
                  fullWidth margin="normal" label="New Password" name="password" type={showPassword ? "text" : "password"} sx={textFieldStyles}
                  value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password as string}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  fullWidth margin="normal" label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} sx={textFieldStyles}
                  value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword as string}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            )}

            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 5, py: 1.5, bgcolor: colors.PRIMARY, color: "white", fontWeight: 600, fontSize: "1rem", textTransform: "none", borderRadius: 2 }}>
              {loading ? (flow === "forgot" ? "Resetting..." : "Verifying...") : (flow === "forgot" ? "Reset Password" : "Verify OTP")}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
                Didn&apos;t receive the OTP?{" "}
                {canResend ? (
                  <Button variant="text" onClick={handleResendOtp} disabled={loading} sx={{ textTransform: "none", fontWeight: 600, color: colors.PRIMARY, p: 0, minWidth: "auto", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>
                    Resend OTP
                  </Button>
                ) : (
                  <Typography component="span" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>
                    Resend in {formatTimer(timer)}
                  </Typography>
                )}
              </Typography>
            </Box>
          </Paper>
        </form>
      </Container>
    </Box>
  );
};

const VerifyOtp = () => {
  return (
    <Suspense fallback={<Box>Loading...</Box>}>
      <VerifyOtpForm />
    </Suspense>
  );
};

export default VerifyOtp;