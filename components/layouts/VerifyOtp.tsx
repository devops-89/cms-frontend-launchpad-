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

const VerifyOtp = () => {
  const { colors } = useAppTheme();

  const router = useRouter();

  const [loading, setLoading] =
    React.useState(false);

  const [errorMessage, setErrorMessage] =
    React.useState("");

  const [successMessage, setSuccessMessage] =
    React.useState("");

  const [otp, setOtp] = React.useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const inputRefs = React.useRef<
    (HTMLInputElement | null)[]
  >([]);

  const formik = useFormik({
    initialValues: {},

    validationSchema: Yup.object({}),

    onSubmit: async () => {
      try {
        setLoading(true);

        setErrorMessage("");
        setSuccessMessage("");

        const finalOtp = otp.join("");

        if (finalOtp.length !== 6) {
          setErrorMessage(
            "Enter complete OTP",
          );

          return;
        }

        const response =
          await AuthControllers.verifyOtp(
            {
              otp: finalOtp,
            },
          );

        setSuccessMessage(
          response?.data?.message ||
            "OTP verified successfully",
        );

        setTimeout(() => {
          router.push(
            "/reset-password",
          );
        }, 1000);
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data
            ?.message ||
            "Invalid OTP",
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleOtpChange = (
    value: string,
    index: number,
  ) => {
    if (!/^\d*$/.test(value)) return;

    const updatedOtp = [...otp];

    updatedOtp[index] =
      value.slice(-1);

    setOtp(updatedOtp);

    if (
      value &&
      index < 5
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    index: number,
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
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
                Verify OTP
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color:
                    colors.TEXT_SECONDARY,

                  mt: 1,
                }}
              >
                Enter 6 digit OTP
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

            <Box
              sx={{
                display: "flex",

                justifyContent:
                  "center",

                gap: 1.5,

                mt: 4,
              }}
            >
              {otp.map(
                (
                  digit,
                  index,
                ) => (
                  <TextField
                    key={index}
                    value={digit}
                    inputRef={(
                      el,
                    ) => {
                      inputRefs.current[
                        index
                      ] = el;
                    }}
                    onChange={(
                      e,
                    ) =>
                      handleOtpChange(
                        e.target
                          .value,
                        index,
                      )
                    }
                    onKeyDown={(
                      e,
                    ) =>
                      handleKeyDown(
                        e,
                        index,
                      )
                    }
                    inputProps={{
                      maxLength: 1,

                      style: {
                        textAlign:
                          "center",

                        fontSize:
                          "24px",

                        fontWeight: 700,
                      },
                    }}
                    sx={{
                      width: 55,

                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,

                          color:
                            colors.TEXT_PRIMARY,

                          "& fieldset":
                            {
                              borderColor:
                                colors.BORDER,
                            },

                          "&:hover fieldset":
                            {
                              borderColor:
                                colors.PRIMARY,
                            },

                          "&.Mui-focused fieldset":
                            {
                              borderColor:
                                colors.PRIMARY,
                            },
                        },
                    }}
                  />
                ),
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 5,

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
                ? "Verifying..."
                : "Verify OTP"}
            </Button>
          </Paper>
        </form>
      </Container>
    </Box>
  );
};

export default VerifyOtp;