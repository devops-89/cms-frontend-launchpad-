"use client";

import React from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";
import { NavigateNext as NextIcon } from "@mui/icons-material";
import { INNOVATION_CATEGORIES } from "./formConstants";
import PatentSection from "./PatentSection";
import ConsentSection from "./ConsentSection";

interface InnovationDetailsStepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onBack: () => void;
  onNext: () => void;
  colors: any;
  textFieldStyles: any;
}

const InnovationDetailsStep: React.FC<InnovationDetailsStepProps> = ({
  formData,
  setFormData,
  onBack,
  onNext,
  colors,
  textFieldStyles,
}) => {
  return (
    <Stack spacing={4}>
      <Box
        sx={{
          p: 6,
          background: `linear-gradient(135deg, ${colors.PRIMARY}08 0%, rgba(255,255,255,1) 100%)`,
          border: `1px solid ${colors.BORDER}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
          Innovation Deep Dive
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: colors.TEXT_SECONDARY, mb: 4 }}
        >
          Provide comprehensive details about your project and its potential
          impact.
        </Typography>

        <Grid container spacing={4}>
          <Grid size={12}>
            <TextField
              select
              fullWidth
              label="Innovation Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              sx={textFieldStyles}
            >
              {INNOVATION_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="What problem is your innovation solving?"
              inputProps={{ maxLength: 3000 }}
              helperText={`${formData.problemSolving.length}/3000 characters`}
              value={formData.problemSolving}
              onChange={(e) =>
                setFormData({ ...formData, problemSolving: e.target.value })
              }
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Brief Description of Your Innovation"
              inputProps={{ maxLength: 3000 }}
              helperText={`${formData.description.length}/3000 characters`}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Vision & Impact"
              placeholder="What is your long-term vision and what impact do you think your innovation can make?"
              inputProps={{ maxLength: 3000 }}
              helperText={`${formData.vision.length}/3000 characters`}
              value={formData.vision}
              onChange={(e) =>
                setFormData({ ...formData, vision: e.target.value })
              }
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Existing Solutions & Advancement"
              placeholder="Mention top 3 existing solutions and explain why your innovation is an advancement"
              inputProps={{ maxLength: 3000 }}
              helperText={`${formData.existingSolutions.length}/3000 characters`}
              value={formData.existingSolutions}
              onChange={(e) =>
                setFormData({ ...formData, existingSolutions: e.target.value })
              }
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="YouTube Video Link"
              placeholder="Ensure video is not private"
              value={formData.youtubeLink}
              onChange={(e) =>
                setFormData({ ...formData, youtubeLink: e.target.value })
              }
              sx={textFieldStyles}
            />
            <Typography
              variant="caption"
              sx={{
                color: colors.TEXT_SECONDARY,
                mt: 1,
                display: "block",
                fontWeight: 500,
              }}
            >
              * Please ensure the YouTube video is not listed as private so
              judges can view it.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <PatentSection
        formData={formData}
        setFormData={setFormData}
        colors={colors}
        textFieldStyles={textFieldStyles}
      />
      <ConsentSection
        formData={formData}
        setFormData={setFormData}
        colors={colors}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", pt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            px: 6,
            py: 2,
            borderRadius: 0,
            fontWeight: 700,
            textTransform: "none",
            color: colors.TEXT_SECONDARY,
            borderColor: colors.BORDER,
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<NextIcon />}
          onClick={onNext}
          sx={{
            bgcolor: colors.PRIMARY,
            px: 8,
            py: 2,
            borderRadius: 0,
            fontWeight: 800,
            textTransform: "none",
            boxShadow: `0 12px 30px ${colors.PRIMARY}40`,
            "&:hover": {
              bgcolor: colors.PRIMARY,
              opacity: 0.9,
              transform: "translateY(-2px)",
            },
          }}
        >
          Review Application
        </Button>
      </Box>
    </Stack>
  );
};

export default InnovationDetailsStep;
