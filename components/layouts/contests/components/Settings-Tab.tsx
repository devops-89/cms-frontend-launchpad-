"use client";
import React from "react";
import { Box, Typography, Switch, FormControlLabel, Divider, Stack, Button } from "@mui/material";
import { roboto } from "@/utils/fonts";

const SettingsTab = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
        Contest Settings
      </Typography>
      
      <Stack spacing={3}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Allow New Registrations</Typography>
              <Typography variant="caption" color="text.secondary">Enable or disable new users from joining this contest.</Typography>
            </Box>
          }
        />
        <Divider />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Public Visibility</Typography>
              <Typography variant="caption" color="text.secondary">Make this contest visible on the public landing page.</Typography>
            </Box>
          }
        />
        <Divider />
        <FormControlLabel
          control={<Switch />}
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Auto-Moderate Entries</Typography>
              <Typography variant="caption" color="text.secondary">Automatically approve entries based on predefined criteria.</Typography>
            </Box>
          }
        />
      </Stack>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary">Save Changes</Button>
      </Box>
    </Box>
  );
};

export default SettingsTab;
