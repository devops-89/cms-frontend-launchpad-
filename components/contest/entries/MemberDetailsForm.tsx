"use client";

import React from "react";
import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  Stack,
  Divider,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DeleteOutline as RemoveIcon,
  PersonOutline as PersonalIcon,
  SupervisorAccount as GuardianIcon,
  School as AcademicIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface MemberDetailsFormProps {
  memberIndex: number;
  data: any;
  onChange: (field: string, value: any) => void;
  onRemove?: () => void;
  colors: any;
  textFieldStyles: any;
}

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const GENDERS = ["Male", "Female", "Other"];

const SectionHeader = ({ icon: Icon, title, colors }: any) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1.5}
    sx={{ mb: 3, mt: 1 }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "12px",
        bgcolor: `${colors.PRIMARY}10`,
        color: colors.PRIMARY,
      }}
    >
      <Icon fontSize="small" />
    </Box>
    <Typography
      variant="subtitle1"
      sx={{
        fontWeight: 800,
        color: colors.TEXT_PRIMARY,
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </Typography>
  </Stack>
);

const MemberDetailsForm: React.FC<MemberDetailsFormProps> = ({
  memberIndex,
  data,
  onChange,
  onRemove,
  colors,
  textFieldStyles,
}) => {
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              bgcolor: colors.PRIMARY,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              fontWeight: 900,
              boxShadow: `0 6px 16px ${colors.PRIMARY}30`,
            }}
          >
            {memberIndex + 1}
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: colors.TEXT_PRIMARY,
                fontWeight: 900,
                lineHeight: 1.2,
                fontSize: "1.15rem",
              }}
            >
              {memberIndex === 0
                ? "Primary Team Lead"
                : `Collaborator #${memberIndex + 1}`}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500 }}
            >
              Entry details for this participant
            </Typography>
          </Box>
        </Stack>

        {onRemove && (
          <Tooltip title="Remove Participant">
            <IconButton
              onClick={onRemove}
              size="small"
              sx={{
                color: colors.TEXT_SECONDARY,
                border: `1.5px solid ${colors.BORDER}`,
                borderRadius: "12px",
                p: 1,
                "&:hover": {
                  color: colors.ERROR,
                  bgcolor: `${colors.ERROR}08`,
                  borderColor: colors.ERROR,
                },
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Grid container spacing={4}>
        {/* Personal Details Section */}
        <Grid size={12}>
          <SectionHeader
            icon={PersonalIcon}
            title="Personal Profiles"
            colors={colors}
          />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Ex: John Doe"
                value={data.name || ""}
                onChange={(e) => onChange("name", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                fullWidth
                label="Gender"
                value={data.gender || ""}
                onChange={(e) => onChange("gender", e.target.value)}
                sx={textFieldStyles}
              >
                {GENDERS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <DatePicker
                label="Date of Birth"
                value={data.dob || null}
                onChange={(val) => onChange("dob", val)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: textFieldStyles,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0px",
                    bgcolor: "transparent",
                    "& fieldset": {
                      borderRadius: "0px",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ borderStyle: "dashed", opacity: 0.4 }} />
        </Grid>

        {/* Guardian Details Section */}
        <Grid size={12}>
          <SectionHeader
            icon={GuardianIcon}
            title="Guardian Contacts"
            colors={colors}
          />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Father's/Guardian's Name"
                placeholder="Full Name"
                value={data.fatherName || ""}
                onChange={(e) => onChange("fatherName", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Father's/Guardian's Email"
                placeholder="Email ID"
                value={data.fatherEmail || ""}
                onChange={(e) => onChange("fatherEmail", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Mother's/Guardian's Name"
                placeholder="Full Name"
                value={data.motherName || ""}
                onChange={(e) => onChange("motherName", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Mother's/Guardian's Email"
                placeholder="Email ID"
                value={data.motherEmail || ""}
                onChange={(e) => onChange("motherEmail", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ borderStyle: "dashed", opacity: 0.4 }} />
        </Grid>

        {/* Academic Details Section */}
        <Grid size={12}>
          <SectionHeader
            icon={AcademicIcon}
            title="Academic Information"
            colors={colors}
          />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label="School Name"
                placeholder="Your official registered school"
                value={data.schoolName || ""}
                onChange={(e) => onChange("schoolName", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Principal Email"
                placeholder="Email"
                value={data.schoolHeadEmail || ""}
                onChange={(e) => onChange("schoolHeadEmail", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="School Address"
                placeholder="Detailed school location"
                value={data.schoolAddress || ""}
                onChange={(e) => onChange("schoolAddress", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="City"
                placeholder="Ex: Dubai"
                value={data.city || ""}
                onChange={(e) => onChange("city", e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Emirate"
                value={data.emirate || ""}
                onChange={(e) => onChange("emirate", e.target.value)}
                sx={textFieldStyles}
              >
                {EMIRATES.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberDetailsForm;
