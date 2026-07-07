"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { roboto } from "@/utils/fonts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";
import { useSnackbar } from "@/context/SnackbarContext";

const SettingsTab = ({ contest }: { contest?: any }) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  
  const [allowNewRegistrations, setAllowNewRegistrations] = useState(true);
  const [publicVisibility, setPublicVisibility] = useState(true);
  const [autoModerateEntries, setAutoModerateEntries] = useState(false);
  const isOffline = contest?.status?.toLowerCase() === 'offline';

  useEffect(() => {
    if (contest) {
      setAllowNewRegistrations(contest.allow_new_registrations ?? true);
      setPublicVisibility(contest.public_visibility ?? true);
      setAutoModerateEntries(contest.auto_moderate_entries ?? false);
    }
  }, [contest]);

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!contest?.id) throw new Error("Contest ID not found");
      return contestControllers.updateContest(contest.id, {
        allow_new_registrations: allowNewRegistrations,
        public_visibility: publicVisibility,
        auto_moderate_entries: autoModerateEntries,
      } as any);
    },
    onSuccess: async () => {
      showSnackbar("Contest settings updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["contest", contest?.id] });
      
      // If auto-moderate is enabled, also trigger the cron
      if (autoModerateEntries) {
        try {
          await entryControllers.runAutoApproveCron();
          showSnackbar("Auto-approve cron executed successfully", "success");
        } catch (error) {
          console.error("Failed to execute auto-approve cron", error);
        }
      }
    },
    onError: (error: any) => {
      showSnackbar(error?.response?.data?.message || "Failed to update settings", "error");
    },
  });

  const handleSave = () => {
    if (
      allowNewRegistrations === (contest?.allow_new_registrations ?? true) &&
      publicVisibility === (contest?.public_visibility ?? true) &&
      autoModerateEntries === (contest?.auto_moderate_entries ?? false)
    ) {
      showSnackbar("No changes to save. Please modify a setting first.", "info");
      return;
    }
    updateSettingsMutation.mutate();
  };

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
          control={
            <Switch
              disabled={isOffline}
              checked={allowNewRegistrations}
              onChange={(e) => setAllowNewRegistrations(e.target.checked)}
            />
          }
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
          control={
            <Switch
              disabled={isOffline}
              checked={publicVisibility}
              onChange={(e) => setPublicVisibility(e.target.checked)}
            />
          }
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
          control={
            <Switch
              disabled={isOffline}
              checked={autoModerateEntries}
              onChange={(e) => setAutoModerateEntries(e.target.checked)}
            />
          }
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
      </Stack>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending || isOffline}
        >
          {updateSettingsMutation.isPending ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsTab;
