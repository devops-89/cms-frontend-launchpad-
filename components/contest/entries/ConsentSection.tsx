"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

interface ConsentSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  colors: any;
}

const ConsentSection: React.FC<ConsentSectionProps> = ({
  formData,
  setFormData,
  colors,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{ p: 5, border: `1px solid ${colors.BORDER}`, bgcolor: "white" }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>
        Data Use Consent
      </Typography>
      <Stack spacing={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.consentDataUse}
              onChange={(e) =>
                setFormData({ ...formData, consentDataUse: e.target.checked })
              }
              sx={{ "&.Mui-checked": { color: colors.PRIMARY } }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: colors.TEXT_SECONDARY }}
            >
              By participating in this competition I hereby give consent for my
              information to be used for evaluation.
            </Typography>
          }
        />
        <Box
          sx={{
            p: 4,
            bgcolor: "rgba(0,0,0,0.02)",
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              mb: 1,
              textTransform: "uppercase",
              fontSize: "0.75rem",
            }}
          >
            Disclaimer
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.TEXT_SECONDARY, display: "block", mb: 3 }}
          >
            If you believe your idea is original, we strongly advise protecting
            it through a patent application. Top Young Innovators bears no
            responsibility should your idea enter the public domain.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consentParent}
                onChange={(e) =>
                  setFormData({ ...formData, consentParent: e.target.checked })
                }
                sx={{ "&.Mui-checked": { color: colors.PRIMARY } }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                I confirm that I have obtained my parent's/guardian's consent.
              </Typography>
            }
          />
        </Box>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              mb: 1,
              textTransform: "uppercase",
              fontSize: "0.75rem",
            }}
          >
            Terms and Conditions
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, consentTerms: e.target.checked })
                }
                sx={{ "&.Mui-checked": { color: colors.PRIMARY } }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                I agree to the{" "}
                <a
                  href="#"
                  style={{
                    color: colors.PRIMARY,
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default ConsentSection;
