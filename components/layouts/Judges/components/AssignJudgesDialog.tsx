"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import {
  Close as CloseIcon,
  EmojiEvents as ContestIcon,
} from "@mui/icons-material";

import { contestControllers } from "@/api/contestControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useQueries, useQuery } from "@tanstack/react-query";
interface AssignJudgesDialogProps {
  open: boolean;
  onClose: () => void;
  judges: {
    id: string;
    name: string;
  }[];
}
const AssignJudgesDialog: React.FC<AssignJudgesDialogProps> = ({
  open,
  onClose,
  judges,
}) => {
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  const [selectedContestId, setSelectedContestId] = useState<string | null>(
    null,
  );
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: contestsData, isLoading: contestsLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: () => contestControllers.getContest(),
    enabled: open,
  });
  const publishedContests = useMemo(() => {
    const list = Array.isArray(contestsData?.data)
      ? contestsData.data
      : Array.isArray(contestsData)
        ? contestsData
        : [];
    return list.filter(
      (contest: any) => contest.status?.toLowerCase() === "published",
    );
  }, [contestsData]);

  const participantsQueries = useQueries({
    queries: publishedContests.map((contest: any) => ({
      queryKey: ["participants", contest.id || contest._id],
      queryFn: () =>
        contestControllers.getAllParticipants(contest.id || contest._id),
      enabled: open && !!(contest.id || contest._id),
    })),
  });

  const participantsLoading = participantsQueries.some((q) => q.isLoading);
  const contests = useMemo(() => {
    return publishedContests.map((contest: any, index: number) => {
      const participantsData = participantsQueries[index]?.data as any;
      const participantsList = Array.isArray(participantsData?.data)
        ? participantsData.data
        : Array.isArray(participantsData)
          ? participantsData
          : [];
      const mappedParticipants = participantsList.map((participant: any) => {
        const data = participant?.submission?.data || {};
        return {
          id: participant.id,
          fullName: `${data.yg9snrxlh || ""} ${data.os87u0nm1 || ""}`.trim(),
          grade: data["47am7ohch"] || "N/A",
          email: data.ftzrxhfpd || "",
          school: data["01gvl1b7e"] || "",
          country: data["u3ibxwa6w"] || "",
        };
      });
      return {
        id: contest.id || contest._id,
        title: contest.name || contest.title || "Untitled Contest",
        status: contest.status,
        totalParticipants: mappedParticipants.length,
        participants: mappedParticipants,
      };
    });
  }, [publishedContests, participantsQueries]);

  const selectedContest = useMemo(() => {
    if (!selectedContestId) return null;
    return contests.find((c: any) => c.id === selectedContestId) || null;
  }, [selectedContestId, contests]);
  useEffect(() => {
    if (open) {
      setSelectedContestId(null);
      setSelectedParticipants([]);
    }
  }, [open]);
  const handleAssign = async () => {
    if (!selectedContest) {
      showSnackbar("Please select a contest", "warning");
      return;
    }
    if (selectedParticipants.length === 0) {
      showSnackbar("Please select participants", "warning");
      return;
    }
    try {
      setLoading(true);
      for (const judge of judges) {
        await contestControllers.assignJudgeToContest(selectedContest.id, {
          judge_id: judge.id,
          participant_ids: selectedParticipants.map((participant: any) => participant.id),
        });
      }
      showSnackbar("Judges assigned successfully", "success");
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to assign judges", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ minWidth: { xs: 320, sm: 550, md: 720 } }}>
      <DialogTitle
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }} >
            Assign Judges
          </Typography>
          <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY }}>
            Assign judges to contests and participants
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
            Select Published Contest
          </Typography>
          <Autocomplete
            options={contests}
            loading={contestsLoading || participantsLoading}
            value={selectedContest}
            onChange={(_, newValue) => {
              setSelectedContestId(newValue ? newValue.id : null);
              setSelectedParticipants([]);
              }}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (<TextField {...params} placeholder="Choose contest..." />)}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} >
                    {option.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY}} >
                    Published • {option.totalParticipants} participants
                  </Typography>
                </Box>
              </li>
            )}
          />
        </Box>
        {selectedContest && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700}}>
              Select Participants
            </Typography>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={selectedContest.participants || []}
              value={selectedParticipants}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValue) => setSelectedParticipants(newValue)}
              getOptionLabel={(option: any) =>`${option.fullName} (${option.grade})`}
              renderTags={() => null}
              renderInput={(params) => (
                <TextField {...params} placeholder="Choose participants..." />
              )}
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Checkbox checked={selected} sx={{ mr: 1}}/>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} >
                        {option.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block", color: colors.TEXT_SECONDARY }}>
                        Grade: {option.grade}
                      </Typography>
                      <Typography variant="caption" sx={{display: "block",color: colors.TEXT_SECONDARY }} >
                        {option.school}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
            />
            {selectedParticipants.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {selectedParticipants.map((participant: any) => (
                  <Chip
                    key={participant.id}
                    label={`${participant.fullName} (${participant.grade})`}
                    onDelete={() => setSelectedParticipants((prev) => prev.filter((p: any) => p.id !== participant.id))}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
        {selectedContest && selectedParticipants.length > 0 && (
          <Box
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: "rgba(99,102,241,0.04)",
              border: `1px dashed ${colors.PRIMARY}30`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                fontWeight: 800,
                color: colors.PRIMARY,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ContestIcon sx={{ fontSize: 18}}/>
              Assignment Summary
            </Typography>
            <Typography variant="body2" sx={{ mb: 1}}>
              Contest:
              <strong> {selectedContest.title}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1}} >
              Total Participants:
              <strong> {selectedContest.totalParticipants}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1}}>
              Selected Participants:
              <strong> {selectedParticipants.length}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Judges:
              <strong> {judges.length}</strong>
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {selectedParticipants.map((participant: any) => (
                <Chip
                  key={participant.id}
                  label={`${participant.fullName} (${participant.grade})`}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions
        sx={{ p: 3,gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            px: 4,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={loading || !selectedContest || selectedParticipants.length === 0}
          sx={{
            px: 5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {loading ? (<CircularProgress size={20} color="inherit" />) : ("Assign Judges")}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AssignJudgesDialog;
