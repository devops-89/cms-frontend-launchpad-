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
  Paper,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  NavigateNext as NextIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import MemberDetailsForm from "./MemberDetailsForm";

interface InnovationOverviewProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  colors: any;
  textFieldStyles: any;
  handleMemberChange: (idx: number, field: string, value: any) => void;
  handleAddMember: () => void;
  handleRemoveMember: (idx: number) => void;
}

const InnovationOverview: React.FC<InnovationOverviewProps> = ({
  formData,
  setFormData,
  onNext,
  colors,
  textFieldStyles,
  handleMemberChange,
  handleAddMember,
  handleRemoveMember,
}) => {
  return (
    <Stack spacing={4}>
      {/* Innovation Banner Section */}
      <Box
        sx={{
          p: 6,
          background: `linear-gradient(135deg, ${colors.PRIMARY}08 0%, rgba(255,255,255,1) 100%)`,
          borderRadius: 6,
          border: `1px solid ${colors.BORDER}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.02)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: `${colors.PRIMARY}05`,
            filter: "blur(40px)",
          }}
        />

        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: colors.TEXT_PRIMARY,
                fontWeight: 900,
                mb: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Project Innovation
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.TEXT_SECONDARY, mb: 4 }}
            >
              Begin your journey by defining the core details of your innovation
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ lg: 8, xs: 12 }}>
              <TextField
                fullWidth
                label="Innovation Title"
                placeholder="Enter the catchphrase of your idea"
                value={formData.innovationTitle}
                onChange={(e) =>
                  setFormData({ ...formData, innovationTitle: e.target.value })
                }
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ lg: 4, xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Current Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                sx={textFieldStyles}
              >
                <MenuItem value="Draft">Drafting</MenuItem>
                <MenuItem value="In Progress">In Development</MenuItem>
                <MenuItem value="Completed">Ready to Launch</MenuItem>
              </TextField>
            </Grid>
            <Grid size={12}>
              <Box
                sx={{
                  border: `2px dashed ${colors.BORDER}`,
                  borderRadius: 5,
                  p: 4,
                  textAlign: "center",
                  bgcolor: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  transition: "all 0.4s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 180,
                  "&:hover": {
                    borderColor: colors.PRIMARY,
                    bgcolor: "white",
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      setFormData({
                        ...formData,
                        thumbnail: e.target.files[0],
                      });
                  }}
                />
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "18px",
                    bgcolor: formData.thumbnail
                      ? `${colors.ACCENT}15`
                      : `${colors.PRIMARY}10`,
                    color: formData.thumbnail ? colors.ACCENT : colors.PRIMARY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  {formData.thumbnail ? (
                    <SuccessIcon />
                  ) : (
                    <UploadIcon sx={{ fontSize: 28 }} />
                  )}
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 800,
                      color: colors.TEXT_PRIMARY,
                      mb: 0.5,
                    }}
                  >
                    {formData.thumbnail
                      ? "Thumbnail Selected"
                      : "Innovation Visual (Thumbnail)"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}
                  >
                    {formData.thumbnail
                      ? formData.thumbnail.name
                      : "Drag and drop your project cover here or click to browse"}
                  </Typography>
                </Box>
                {formData.thumbnail && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 2,
                      color: colors.PRIMARY,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Click to replace image
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </Box>

      <Stack spacing={4}>
        {formData.members.map((member: any, idx: number) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 6,
              border: `1px solid ${colors.BORDER}`,
              bgcolor: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: `${colors.PRIMARY}40`,
                boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
                transform: "translateY(-4px)",
              },
            }}
          >
            <MemberDetailsForm
              memberIndex={idx}
              data={member}
              onChange={(f, v) => handleMemberChange(idx, f, v)}
              onRemove={idx > 0 ? () => handleRemoveMember(idx) : undefined}
              colors={colors}
              textFieldStyles={textFieldStyles}
            />
          </Paper>
        ))}
      </Stack>

      {formData.members.length < 5 && (
        <Button
          fullWidth
          variant="outlined"
          onClick={handleAddMember}
          startIcon={<UploadIcon sx={{ transform: "rotate(180deg)" }} />}
          sx={{
            py: 2.5,
            borderRadius: 4,
            border: `2px dashed ${colors.BORDER}`,
            color: colors.TEXT_SECONDARY,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": {
              border: `2px dashed ${colors.PRIMARY}`,
              bgcolor: `${colors.PRIMARY}05`,
              color: colors.PRIMARY,
            },
          }}
        >
          Partner up? Add another team member ({formData.members.length}/5)
        </Button>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 4 }}>
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
          Next: Innovation Details
        </Button>
      </Box>
    </Stack>
  );
};

export default InnovationOverview;
