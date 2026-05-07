"use client";

import React from "react";

import {
  Alert,
  Box,
  Button,
  Collapse,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

import { AuthControllers } from "@/api/authControllers";
import { useAppTheme } from "@/context/ThemeContext";

const ForgotPassword = () => {
  const { colors } = useAppTheme();

  const router = useRouter();

  const [loading, setLoading] =
    React.useState(false);

  const [successMessage, setSuccessMessage] =
    React.useState("");

  const [errorMessage, setErrorMessage] =
    React.useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .email("Enter valid email")
        .required("Email is required"),
    }),

    onSubmit: async (values) => {
      try {
        setLoading(true);

        setErrorMessage("");
        setSuccessMessage("");

        const response =
          await AuthControllers.forgotPassword(
            values,
          );

        setSuccessMessage(
          response?.data?.message ||
            "OTP sent successfully",
        );

        localStorage.setItem(
          "resetEmail",
          values.email,
        );

        setTimeout(() => {
          router.push(
            "/verify-otp",
          );
        }, 1000);
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data
            ?.message ||
            "Failed to send OTP",
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: colors.TEXT_PRIMARY,

      "& fieldset": {
        borderColor: colors.BORDER,
      },

      "&:hover fieldset": {
        borderColor: colors.PRIMARY,
      },

      "&.Mui-focused fieldset": {
        borderColor: colors.PRIMARY,
      },
    },

    "& .MuiInputLabel-root": {
      color: colors.TEXT_SECONDARY,
    },

    "& .MuiInputLabel-root.Mui-focused":
      {
        color: colors.PRIMARY,
      },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        background:
          "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",

        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <form
          onSubmit={
            formik.handleSubmit
          }
        >
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 4,
                md: 6,
              },

              borderRadius: 4,

              background:
                "rgba(255,255,255,0.8)",

              backdropFilter:
                "blur(12px)",

              border: `1px solid ${colors.BORDER}`,

              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <Box
              sx={{
                mb: 4,

                textAlign:
                  "center",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,

                  color:
                    colors.TEXT_PRIMARY,
                }}
              >
                Forgot Password
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color:
                    colors.TEXT_SECONDARY,

                  mt: 1,
                }}
              >
                Enter your email to
                receive OTP
              </Typography>
            </Box>

            <Collapse
              in={Boolean(
                errorMessage,
              )}
            >
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                }}
              >
                {errorMessage}
              </Alert>
            </Collapse>

            <Collapse
              in={Boolean(
                successMessage,
              )}
            >
              <Alert
                severity="success"
                sx={{
                  mb: 2,
                }}
              >
                {successMessage}
              </Alert>
            </Collapse>

            <TextField
              fullWidth
              margin="normal"
              id="email"
              label="Email Address"
              name="email"
              variant="outlined"
              sx={textFieldStyles}
              value={
                formik.values.email
              }
              onChange={
                formik.handleChange
              }
              onBlur={
                formik.handleBlur
              }
              error={
                formik.touched
                  .email &&
                Boolean(
                  formik.errors
                    .email,
                )
              }
              helperText={
                formik.touched
                  .email &&
                formik.errors.email
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,

                py: 1.5,

                bgcolor:
                  colors.PRIMARY,

                color: "white",

                fontWeight: 600,

                fontSize: "1rem",

                textTransform:
                  "none",

                borderRadius: 2,
              }}
            >
              {loading
                ? "Sending OTP..."
                : "Send OTP"}
            </Button>
          </Paper>
        </form>
      </Container>
    </Box>
  );
};

export default ForgotPassword;