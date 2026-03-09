"use client";

import React from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Stack,
  MenuItem,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { COUNTRIES } from "./formConstants";

interface PatentSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  colors: any;
  textFieldStyles: any;
}

const PatentSection: React.FC<PatentSectionProps> = ({
  formData,
  setFormData,
  colors,
  textFieldStyles,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{ p: 5, border: `1px solid ${colors.BORDER}`, bgcolor: "white" }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>
        Patent Details
      </Typography>
      <Stack spacing={4}>
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            sx={{ fontWeight: 700, color: colors.TEXT_PRIMARY, mb: 2 }}
          >
            Have you filed a patent application for your innovation?
          </FormLabel>
          <RadioGroup
            row
            value={formData.hasPatent}
            onChange={(e) =>
              setFormData({ ...formData, hasPatent: e.target.value })
            }
          >
            <FormControlLabel
              value="Yes"
              control={
                <Radio sx={{ "&.Mui-checked": { color: colors.PRIMARY } }} />
              }
              label="Yes"
            />
            <FormControlLabel
              value="No"
              control={
                <Radio sx={{ "&.Mui-checked": { color: colors.PRIMARY } }} />
              }
              label="No"
            />
          </RadioGroup>
        </FormControl>
        {formData.hasPatent === "No" && (
          <Box
            sx={{
              p: 3,
              bgcolor: `${colors.PRIMARY}05`,
              borderLeft: `4px solid ${colors.PRIMARY}`,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Our team of experts will work with you to file a US patent. To
              learn more click{" "}
              <a
                href="#"
                style={{
                  color: colors.PRIMARY,
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                here
              </a>
              .
            </Typography>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel
                component="legend"
                sx={{ fontWeight: 700, color: colors.TEXT_PRIMARY, mb: 1 }}
              >
                If you have not filed a Patent, do you need help?
              </FormLabel>
              <RadioGroup
                value={formData.patentHelp}
                onChange={(e) =>
                  setFormData({ ...formData, patentHelp: e.target.value })
                }
              >
                <FormControlLabel
                  value="Yes, please help me"
                  control={
                    <Radio
                      sx={{ "&.Mui-checked": { color: colors.PRIMARY } }}
                    />
                  }
                  label="Yes, please help me."
                />
                <FormControlLabel
                  value="No, I do not need help"
                  control={
                    <Radio
                      sx={{ "&.Mui-checked": { color: colors.PRIMARY } }}
                    />
                  }
                  label="No, I do not need help in filing patent."
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}
        {formData.hasPatent === "Yes" && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Patent Application No."
                value={formData.patentAppNo}
                onChange={(e) =>
                  setFormData({ ...formData, patentAppNo: e.target.value })
                }
                sx={textFieldStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Country Patent Filed In"
                value={formData.patentCountry}
                onChange={(e) =>
                  setFormData({ ...formData, patentCountry: e.target.value })
                }
                sx={textFieldStyles}
              >
                {COUNTRIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Patent Filing Date"
                  value={formData.patentDate}
                  onChange={(val) =>
                    setFormData({ ...formData, patentDate: val })
                  }
                  slotProps={{
                    textField: { fullWidth: true, sx: textFieldStyles },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "0px" } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Google Patent Link"
                value={formData.patentGoogleLink}
                onChange={(e) =>
                  setFormData({ ...formData, patentGoogleLink: e.target.value })
                }
                sx={textFieldStyles}
              />
            </Grid>
          </Grid>
        )}
      </Stack>
    </Paper>
  );
};

export default PatentSection;
