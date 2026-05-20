"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Button,
  Grid,
} from "@mui/material";
import { roboto } from "@/utils/fonts";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

const SettingsTab = () => {
  const [votingStartDate, setVotingStartDate] = useState<Dayjs | null>(null);
  const [votingEndDate, setVotingEndDate] = useState<Dayjs | null>(null);

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 600, fontFamily: roboto.style.fontFamily }}
      >
        Contest Settings
      </Typography>

      <Stack spacing={3}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Allow New Registrations
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Enable or disable new users from joining this contest.
              </Typography>
            </Box>
          }
        />
        <Divider />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Public Visibility
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Make this contest visible on the public landing page.
              </Typography>
            </Box>
          }
        />
        <Divider />
        <FormControlLabel
          control={<Switch />}
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Auto-Moderate Entries
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Automatically approve entries based on predefined criteria.
              </Typography>
            </Box>
          }
        />
        <Divider />
        {/* <Box>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>Voting Period</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Set the start and end dates for the voting phase.</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Voting Start Date"
                  value={votingStartDate}
                  onChange={(newValue) => setVotingStartDate(newValue)}
                  sx={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Voting End Date"
                  value={votingEndDate}
                  onChange={(newValue) => setVotingEndDate(newValue)}
                  sx={{ width: "100%" }}
                  minDate={votingStartDate || undefined}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box> */}
      </Stack>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary">
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsTab;
