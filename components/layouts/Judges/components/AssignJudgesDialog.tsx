"use client";

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
import React, { useEffect, useMemo, useState } from "react";

import {
    Close as CloseIcon,
    EmojiEvents as ContestIcon,
} from "@mui/icons-material";

import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";
import { UserController } from "@/api/userControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
interface AssignJudgesDialogProps {
  open: boolean;
  onClose: () => void;
  judges: {
    id: string;
    name: string;
  }[];
  initialContestId?: string;
  initialSelectedEntryIds?: string[];
}
const AssignJudgesDialog: React.FC<AssignJudgesDialogProps> = ({
  open,
  onClose,
  judges,
  initialContestId,
  initialSelectedEntryIds,
}) => {
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [selectedContestId, setSelectedContestId] = useState<string | null>(initialContestId || null);
  const [selectedEntries, setSelectedEntries] = useState<any[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: contestsData, isLoading: contestsLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: () => contestControllers.getContest(),
    enabled: open,
  });
  const publishedContests = useMemo(() => {
    const list = Array.isArray(contestsData?.data?.docs) ? contestsData.data.docs : [];
    return list.filter(
      (contest: any) => contest.status?.toLowerCase() === "published",
    );
  }, [contestsData]);

  const { data: entriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ["entries", selectedContestId],
    queryFn: () => entryControllers.getAllEntries(selectedContestId!, 1, 1000),
    enabled: open && !!selectedContestId,
  });

  const { data: contestDetailsData } = useQuery({
    queryKey: ["contestDetails", selectedContestId],
    queryFn: () => contestControllers.getContestDetails(selectedContestId!),
    enabled: open && !!selectedContestId,
  });

  const { data: assignedJudgesData } = useQuery({
    queryKey: ["assigned-judges", selectedContestId],
    queryFn: () => contestControllers.getAssignedJudges(selectedContestId!),
    enabled: open && !!selectedContestId,
  });

  const assignedEntryIds = useMemo(() => {
    const ids = new Set<string>();
    if (!assignedJudgesData) return ids;

    const findIds = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach(findIds);
      } else {
        if (obj.entry_id) ids.add(obj.entry_id);
        if (obj.entry_ids && Array.isArray(obj.entry_ids)) {
          obj.entry_ids.forEach((id: string) => ids.add(id));
        }
        if (obj.entryAssignments && Array.isArray(obj.entryAssignments)) {
          obj.entryAssignments.forEach((a: any) => {
             if (a.entry_id) ids.add(a.entry_id);
          });
        }
        Object.values(obj).forEach(findIds);
      }
    };

    findIds(assignedJudgesData);

    return ids;
  }, [assignedJudgesData, selectedContestId]);

  const availableEntries = useMemo(() => {
    if (!entriesData) return [];
    const list = Array.isArray(entriesData) ? entriesData : 
      Array.isArray(entriesData?.docs) ? entriesData.docs :
      Array.isArray(entriesData?.data) ? entriesData.data :
      Array.isArray(entriesData?.data?.docs) ? entriesData.data.docs :
      Array.isArray(entriesData?.data?.data) ? entriesData.data.data :
      Array.isArray(entriesData?.data?.entries) ? entriesData.data.entries : [];

    return list
      .filter((entry: any) => {
        const s = entry.status?.toLowerCase() || "";
        if (s !== "approved") return false;

        // If editing and this entry is already assigned to THIS judge, keep it visible
        if (initialSelectedEntryIds && initialSelectedEntryIds.includes(entry.id)) {
          return true;
        }

        // Otherwise, hide it if it's already assigned to any judge
        if (entry.isAssigned === true) return false;
        return !assignedEntryIds.has(entry.id);
      })
      .map((entry: any) => {
      const submissionData = entry?.submission?.data || {};
      const participantData = entry?.participant?.submission?.data || {};
      
      const sData = submissionData?.data ? submissionData.data : submissionData;
      const pData = participantData?.data ? participantData.data : participantData;

      const contest = contestDetailsData?.data || publishedContests.find((c: any) => c.id === entry.contest_id || c._id === entry.contest_id) || entry?.contest;
      const entryFields = contest?.entry_level_template?.schema?.fields || contest?.entryLevelTemplate?.schema?.fields || [];
      const userFields = contest?.user_level_template?.schema?.fields || contest?.userLevelTemplate?.schema?.fields || [];

      // Title logic
      let title = "";
      const entryTitleField = entryFields?.find((f: any) => {
        const l = f.label?.toLowerCase() || "";
        return l.includes("title") || l.includes("project");
      });
      if (entryTitleField && sData) {
        title = sData[entryTitleField.label] || sData[entryTitleField.id];
      }
      if (!title) {
        title = sData?.name_1 || sData?.ho1p00z0q || sData?.["Innovation Title"] || sData?.zvdskzwrw;
      }
      if (!title && sData) {
        const values = Object.entries(sData)
          .filter(([k, v]: [string, any]) => !["status", "isdraft"].includes(k.toLowerCase()) && typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v))
          .map(([k, v]) => v);
        if (values.length > 0) title = values[0] as string;
      }
      if (!title) title = `Entry #${entry.entry_id?.substring(0, 8) || entry.id?.substring(0, 8) || "Untitled"}`;
      
      // Author logic
      let author = "";
      const firstNameField = userFields.find((f: any) => {
        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
        return l.includes("firstname") || l === "first";
      });
      const lastNameField = userFields.find((f: any) => {
        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
        return l.includes("lastname") || l === "last";
      });
      const fullNameField = userFields.find((f: any) => {
        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
        return l.includes("fullname") || l === "name" || (l.includes("name") && !l.includes("first") && !l.includes("last"));
      });

      if (firstNameField || lastNameField) {
        const first = firstNameField ? (pData[firstNameField.label] || pData[firstNameField.id]) : "";
        const last = lastNameField ? (pData[lastNameField.label] || pData[lastNameField.id]) : "";
        author = `${first || ""} ${last || ""}`.trim();
      }
      
      if (!author && fullNameField && pData && Object.keys(pData).length > 0) {
        author = pData[fullNameField.label] || pData[fullNameField.id];
      }

      if (!author && pData && Object.keys(pData).length > 0) {
        const fallback = userFields.find((f: any) => f.label?.toLowerCase().includes("name"));
        if (fallback && (pData[fallback.label] || pData[fallback.id])) {
          author = pData[fallback.label] || pData[fallback.id];
        } else {
          author = pData.yg9snrxlh || pData.an7ffo0mu || pData.qlon5xekd;
        }
      }

      // FALLBACK: If no author name yet, check entry submission data itself!
      if (!author && sData) {
        const allFields = [...userFields, ...entryFields];
        const fNameField = allFields.find((f: any) => {
          const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
          return l.includes("firstname") || l === "first";
        });
        const lNameField = allFields.find((f: any) => {
          const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
          return l.includes("lastname") || l === "last";
        });
        
        if (fNameField || lNameField) {
          const first = fNameField ? (sData[fNameField.label] || sData[fNameField.id]) : "";
          const last = lNameField ? (sData[lNameField.label] || sData[lNameField.id]) : "";
          author = `${first || ""} ${last || ""}`.trim();
        }
        
        if (!author) {
           author = sData.yg9snrxlh || sData.an7ffo0mu || sData.qlon5xekd || sData.os28hf1aa;
           if (author && sData.tlb9rveot) author += " " + sData.tlb9rveot;
        }
      }
      
      if (!author && pData && Object.keys(pData).length > 0) {
        const values = Object.entries(pData)
          .filter(([k, v]: [string, any]) => !["status", "isdraft"].includes(k.toLowerCase()) && typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v))
          .map(([k, v]) => v);
        if (values.length > 0) author = values[0] as string;
      }

      if (!author) author = "Unknown";

      return {
        id: entry.id,
        title,
        author,
      };
    });
  }, [entriesData, publishedContests]);

  const contests = useMemo(() => {
    return publishedContests.map((contest: any) => ({
      id: contest.id || contest._id,
      title: contest.name || contest.title || "Untitled Contest",
      status: contest.status,
    }));
  }, [publishedContests]);

  const selectedContest = useMemo(() => {
    if (!selectedContestId) return null;
    return contests.find((c: any) => c.id === selectedContestId) || null;
  }, [selectedContestId, contests]);
  useEffect(() => {
    if (open) {
      setSelectedContestId(initialContestId || null);
      setSelectedEntries([]);
      setHasInitialized(false);
    }
  }, [open, initialContestId]);

  useEffect(() => {
    if (
      open &&
      !hasInitialized &&
      initialContestId &&
      initialSelectedEntryIds &&
      availableEntries.length > 0
    ) {
      const initialEntries = availableEntries.filter((entry: any) =>
        initialSelectedEntryIds.includes(entry.id),
      );
      if (initialEntries.length > 0) {
        setSelectedEntries(initialEntries);
      }
      setHasInitialized(true);
    }
  }, [open, availableEntries, initialContestId, initialSelectedEntryIds, hasInitialized]);
  const handleAssign = async () => {
    if (!selectedContest) {
      showSnackbar("Please select a contest", "warning");
      return;
    }
    if (selectedEntries.length === 0) {
      showSnackbar("Please select entries", "warning");
      return;
    }

    if (initialContestId) {
      const currentEntryIds = selectedEntries.map((entry: any) => entry.id);
      const initialIds = initialSelectedEntryIds || [];
      if (currentEntryIds.length === initialIds.length && currentEntryIds.every(id => initialIds.includes(id))) {
        showSnackbar("No changes detected.", "info");
        onClose();
        return;
      }
    }

    try {
      setLoading(true);
      for (const judge of judges) {
        const payload = {
          judge_id: judge.id,
          entry_ids: selectedEntries.map((entry: any) => entry.id),
        };

        if (initialContestId) {
          await contestControllers.updateJudgeAssignments(selectedContest.id, payload);
        } else {
          await contestControllers.assignJudgeToContest(selectedContest.id, payload);
        }
      }
      showSnackbar(`Judges ${initialContestId ? 'updated' : 'assigned'} successfully`, "success");
      
      // Invalidate query to refresh the Judge Assignments Table
      queryClient.invalidateQueries({ queryKey: ["judge-details"] });
      queryClient.invalidateQueries({ queryKey: ["judges"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      
      onClose();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to assign judges";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };
  const isEditMode = !!initialContestId;

  return (
    <Box sx={{ minWidth: { xs: 300, sm: 400, md: 450 }, maxWidth: 500 }}>
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
            {isEditMode ? "Edit Assignments" : "Assign Judges"}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY }}>
            {isEditMode ? "Update the entries assigned to this judge" : "Assign judges to contests and entries"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent 
        sx={{ 
          p: 3, 
          pr: 2,
          minHeight: 240, 
          maxHeight: 340, 
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: colors.BORDER, borderRadius: 2 }
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
            Select Published Contest
          </Typography>
          <Autocomplete
            options={contests}
            loading={contestsLoading || entriesLoading}
            value={selectedContest}
            disabled={isEditMode}
            onChange={(_, newValue) => {
              setSelectedContestId(newValue ? newValue.id : null);
              setSelectedEntries([]);
              }}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (<TextField {...params} placeholder="Choose contest..." />)}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props as any;
              return (
                <li key={key} {...optionProps}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} >
                      {option.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY}} >
                      Published Contest
                    </Typography>
                  </Box>
                </li>
              );
            }}
          />
        </Box>
        {selectedContest && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700}}>
              Select Entries
            </Typography>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={availableEntries}
              value={selectedEntries}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValue) => setSelectedEntries(newValue)}
              getOptionLabel={(option: any) =>`${option.title} (by ${option.author})`}
              renderTags={() => null}
              renderInput={(params) => (
                <TextField {...params} placeholder="Choose entries..." />
              )}
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props as any;
                return (
                  <li key={option.id} {...optionProps}>
                    <Checkbox checked={selected} sx={{ mr: 1}}/>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} >
                        {option.title}
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block", color: colors.TEXT_SECONDARY }}>
                        Author: {option.author}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
            />
            {selectedEntries.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  maxHeight: 120,
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": { bgcolor: colors.BORDER, borderRadius: 2 }
                }}
              >
                {selectedEntries.map((entry: any) => (
                  <Chip
                    key={entry.id}
                    label={`${entry.title}`}
                    onDelete={() => setSelectedEntries((prev) => prev.filter((e: any) => e.id !== entry.id))}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
        {selectedContest && selectedEntries.length > 0 && (
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
              Available Entries:
              <strong> {availableEntries.length}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1}}>
              Selected Entries:
              <strong> {selectedEntries.length}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 0 }}>
              Judges:
              <strong> {judges.length}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
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
          disabled={loading || !selectedContest || selectedEntries.length === 0}
          sx={{
            px: 5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            isEditMode ? "Update Assignments" : "Assign Judges"
          )}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AssignJudgesDialog;
