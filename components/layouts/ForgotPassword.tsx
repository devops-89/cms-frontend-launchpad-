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

import { useAppTheme } from "@/context/ThemeContext";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { useSnackbar } from "@/context/SnackbarContext";
import { getFormikError } from "@/utils/formikHelper";

const ForgotPassword = () => {
  const { colors } = useAppTheme();
  const router = useRouter();

  const { forgotPassword, isLoading: loading, error: errorMessage } = useForgotPassword();
  const { showSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i, "Invalid email address")
        .required("Email is required"),
    }),

    onSubmit: async (values) => {
      try {
        await forgotPassword(values);
      } catch (error: any) {
        // Handled by hook
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



            <TextField
              fullWidth
              margin="normal"
              id="email"
              label="Email Address"
              name="email"
              variant="outlined"
              sx={textFieldStyles}
              value={formik.values.email}
              onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("email", true, false); }}
              onBlur={formik.handleBlur}
              error={Boolean(getFormikError(formik, "email"))}
              helperText={getFormikError(formik, "email") as string}
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
            
            <Button
              fullWidth
              variant="text"
              disabled={loading}
              onClick={() => router.back()}
              sx={{
                mt: 1,
                py: 1.5,
                color: colors.TEXT_SECONDARY,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Back to Login
            </Button>
          </Paper>
        </form>
      </Container>
    </Box>
  );
};

export default ForgotPassword;