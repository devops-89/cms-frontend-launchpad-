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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { DeleteOutline } from "@mui/icons-material";
import { usePermissions } from "@/context/PermissionContext";
import { UserController } from "@/api/userControllers";
import { UserRole } from "@/utils/enum";
import { VotingPeriodPayload } from "@/types/user";

const AddVotingPeriod = ({ votingPeriod }: { votingPeriod?: any }) => {
  const { hasPermission } = usePermissions();
  const canCreateVotingPeriod = hasPermission("Contest Management", "canCreate");
  const canDeleteVotingPeriod = hasPermission("Contest Management", "canDelete");
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
  const [maxScore, setMaxScore] = useState<number | "">(
    votingPeriod && votingPeriod.voting_type === "JUDGE" ? votingPeriod.max_score || "" : ""
  );
  const [criteria, setCriteria] = useState<any[]>(
    votingPeriod && votingPeriod.voting_type === "JUDGE" && votingPeriod.criteria
      ? votingPeriod.criteria
      : [{ description: "", weighting: "" }]
  );
  const [selectedJudges, setSelectedJudges] = useState<any[]>([]);

  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: assignedJudgesData } = useQuery({
    queryKey: ["assigned-judges", contestId],
    queryFn: () => contestControllers.getAssignedJudges(contestId),
    enabled: votingType?.value === "JUDGE" && !!contestId,
  });

  const availableJudges = React.useMemo(() => {
    const assignedData = assignedJudgesData?.data;
    if (!assignedData) return [];
    
    // Support both single object and array responses
    const judgesList = Array.isArray(assignedData) ? assignedData : [assignedData];
    
    return judgesList.map((j: any) => ({
      ...j,
      id: j.judgeProfile?.user?.id,
    }));
  }, [assignedJudgesData]);

  useEffect(() => {
    if (votingPeriod && votingPeriod.voting_type === "JUDGE" && votingPeriod.judge_ids && availableJudges.length > 0) {
      const selected = availableJudges.filter((j: any) => votingPeriod.judge_ids.includes(j.id));
      setSelectedJudges(selected);
    }
  }, [votingPeriod, availableJudges]);

  const handleCloseModal = () => {
    hideModal();
  };

  const addVotingPeriodMutation = useMutation({
    mutationFn: (data: VotingPeriodPayload) =>
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
    mutationFn: (data: VotingPeriodPayload) =>
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
      if (votingType.value === "JUDGE") {
        if (!maxScore || criteria.length === 0 || selectedJudges.length === 0) {
          showSnackbar("Please fill in all judge evaluation fields", "warning");
          return;
        }
      }

      const payload: VotingPeriodPayload = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };

      if (!votingPeriod) {
        payload.voting_type = votingType.value;
      }

      if (votingType.value === "JUDGE") {
        payload.max_score = Number(maxScore);
        payload.criteria = criteria.map((c) => ({
          description: c.description,
          weighting: Number(c.weighting),
        }));
        payload.judge_ids = selectedJudges.map((j) => j.id);
      }

      if (votingPeriod) {
        updateVotingPeriodMutation.mutate(payload);
      } else {
        addVotingPeriodMutation.mutate(payload);
      }
    } else {
      showSnackbar("Please fill in all fields", "warning");
    }
  };

  const isPending = addVotingPeriodMutation.isPending || updateVotingPeriodMutation.isPending;

  return (
    <Box sx={{ width: 600, display: "flex", flexDirection: "column" }}>
      <Box sx={{ textAlign: "end", flexShrink: 0 }}>
        <IconButton onClick={handleCloseModal}>
          <Close />
        </IconButton>
      </Box>
      <Typography
        sx={{
          fontSize: 24,
          fontFamily: roboto.style.fontFamily,
          fontWeight: 600,
          flexShrink: 0,
          mb: 3
        }}
      >
        {votingPeriod ? "Edit Voting Period" : "Add Voting Period"}
      </Typography>
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          maxHeight: "450px", // Strict fixed max-height
          pr: 1,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: "4px" }
        }}
      >
        <Stack spacing={3} sx={{ mb: 2 }}>
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

          {votingType?.value === "JUDGE" && (
            <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Judge Evaluation Configuration
              </Typography>
              
              <TextField
                fullWidth
                label="Maximum Score"
                type="number"
                size="small"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value === "" ? "" : Number(e.target.value))}
                sx={{ mb: 3, bgcolor: "#fff" }}
                required
              />

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Assigned Judges
              </Typography>
              <Autocomplete
                multiple
                options={availableJudges}
                value={selectedJudges}
                onChange={(e, val) => setSelectedJudges(val)}
                getOptionLabel={(option) => {
                  const userObj = option.judgeProfile?.user || option.user || option;
                  const name = userObj.firstName && userObj.lastName ? `${userObj.firstName} ${userObj.lastName}` : userObj.fullName || userObj.name || userObj.email;
                  return name ? name : `Judge`;
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Judges" size="small" sx={{ mb: 3, bgcolor: "#fff" }} required={selectedJudges.length === 0} />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disableCloseOnSelect
              />

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Criteria List
              </Typography>
              {criteria.map((criterion, index) => (
                <Stack key={index} direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Criteria Description"
                    size="small"
                    value={criterion.description}
                    onChange={(e) => {
                      const newC = [...criteria];
                      newC[index].description = e.target.value;
                      setCriteria(newC);
                    }}
                    sx={{ bgcolor: "#fff" }}
                    required
                  />
                  <TextField
                    label="Weighting"
                    type="number"
                    size="small"
                    sx={{ width: 120, bgcolor: "#fff" }}
                    value={criterion.weighting}
                    onChange={(e) => {
                      const newC = [...criteria];
                      newC[index].weighting = e.target.value === "" ? "" : Number(e.target.value);
                      setCriteria(newC);
                    }}
                    required
                  />
                  {criteria.length > 1 && canDeleteVotingPeriod && (
                    <IconButton
                      color="error"
                      onClick={() => {
                        const newC = criteria.filter((_, i) => i !== index);
                        setCriteria(newC);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  )}
                </Stack>
              ))}
              {canCreateVotingPeriod && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setCriteria([...criteria, { description: "", weighting: "" }])}
                  sx={{ textTransform: "capitalize", mt: 1 }}
                >
                  Add another
                </Button>
              )}
            </Box>
          )}

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
      </Box>
    </Box>
  );
};

export default AddVotingPeriod;
