"use client";
import { contestControllers } from "@/api/contestControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { useModal } from "@/store/useModal";
import { VOTING_PERIOD_TYPE_DATA } from "@/utils/constant";
import { COLORS } from "@/utils/enum";
import { roboto } from "@/utils/fonts";
import moment, { Moment } from "moment";
import { Close } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const AddVotingPeriod = ({ votingPeriod }: { votingPeriod?: any }) => {
  const { hideModal } = useModal();
  const params = useParams();
  const id = params?.id;
  const contestId = Array.isArray(id) ? id[0] : (id as string);

  const [votingType, setVotingType] = useState<{ label: string; value: string } | null>(
    votingPeriod
      ? VOTING_PERIOD_TYPE_DATA.find((t) => t.value === votingPeriod.voting_type) || null
      : null
  );
  const [startDate, setStartDate] = useState<Moment | null>(
    votingPeriod ? moment(votingPeriod.start_date) : null
  );
  const [endDate, setEndDate] = useState<Moment | null>(
    votingPeriod ? moment(votingPeriod.end_date) : null
  );
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const handleCloseModal = () => {
    hideModal();
  };

  const addVotingPeriodMutation = useMutation({
    mutationFn: (data: { voting_type: string; start_date: string; end_date: string }) =>
      contestControllers.addVotingPeriod(contestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votingPeriods", contestId] });
      showSnackbar("Voting period created successfully", "success");
      hideModal();
    },
    onError: (err: any) => {
      showSnackbar(
        err?.response?.data?.message || "Failed to create voting period",
        "error"
      );
    },
  });

  const updateVotingPeriodMutation = useMutation({
    mutationFn: (data: { start_date: string; end_date: string }) =>
      contestControllers.updateVotingPeriod(votingPeriod.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votingPeriods", contestId] });
      showSnackbar("Voting period updated successfully", "success");
      hideModal();
    },
    onError: (err: any) => {
      showSnackbar(
        err?.response?.data?.message || "Failed to update voting period",
        "error"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (votingType && startDate && endDate) {
      if (votingPeriod) {
        updateVotingPeriodMutation.mutate({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
      } else {
        addVotingPeriodMutation.mutate({
          voting_type: votingType.value,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
      }
    } else {
      showSnackbar("Please fill in all fields", "warning");
    }
  };

  const isPending = addVotingPeriodMutation.isPending || updateVotingPeriodMutation.isPending;

  return (
    <Box sx={{ width: 600 }}>
      <Box sx={{ textAlign: "end" }}>
        <IconButton onClick={handleCloseModal}>
          <Close />
        </IconButton>
      </Box>
      <Typography
        sx={{
          fontSize: 24,
          fontFamily: roboto.style.fontFamily,
          fontWeight: 600,
        }}
      >
        {votingPeriod ? "Edit Voting Period" : "Add Voting Period"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3} sx={{ mt: 3 }}>
          <Autocomplete
            options={VOTING_PERIOD_TYPE_DATA}
            value={votingType}
            onChange={(event, newValue) => setVotingType(newValue)}
            disabled={!!votingPeriod}
            renderInput={(params) => (
              <TextField {...params} label="Select Voting Type" required />
            )}
          />

          <DatePicker
            label="Start Date"
            disablePast={!votingPeriod}
            value={startDate}
            onChange={(newValue: any) => setStartDate(newValue)}
            slotProps={{ textField: { required: true } }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue: any) => setEndDate(newValue)}
            slotProps={{ textField: { required: true } }}
          />
          <Button
            type="submit"
            disabled={isPending}
            sx={{
              textTransform: "capitalize",
              backgroundColor: COLORS.PRIMARY,
              color: "#ffffff",
              width: "120px",
              px: 3,
            }}
          >
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default AddVotingPeriod;
