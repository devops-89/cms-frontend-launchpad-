"use client";

import {
  AccountCircle,
  ArrowBack,
  CalendarToday,
  CheckCircle,
  EmojiEvents,
  Info,
  Mail,
  Phone,
  Star,
  Tune,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Rating,
  Snackbar,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";
import { judgeControllers } from "@/api/judgeControllers";
import JudgePanelLayout from "@/components/layouts/JudgePanel";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import { useSnackbar } from "@/context/SnackbarContext";

import { EntryHeroCard } from "@/components/layouts/JudgePanel/components/EntryHeroCard";
import { SubmissionDetails } from "@/components/layouts/JudgePanel/components/SubmissionDetails";
import { EvaluationSummary } from "@/components/layouts/JudgePanel/components/EvaluationSummary";
import { EvaluationForm } from "@/components/layouts/JudgePanel/components/EvaluationForm";
import { EvaluationHistory } from "@/components/layouts/JudgePanel/components/EvaluationHistory";

const JudgeEntryDetailsPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [evaluation, setEvaluation] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const mode = searchParams.get("mode") || "view";
  const contestId = searchParams.get("contestId");

  const { data: entryData, isPending: isLoadingEntry } = useQuery({
    queryKey: ["judge-entry", id, contestId],
    queryFn: () => entryControllers.getEntryById(contestId as string, id as string),
    enabled: !!id && !!contestId && mode === "view",
  });

  const entry = entryData?.data;

  const { data: evalData } = useQuery({
    queryKey: ["judge-evaluation", id],
    queryFn: () => judgeControllers.getEvaluation(id as string).catch(() => null),
    enabled: !!id && (mode === "edit" || (mode === "view" && searchParams.get("status")?.toLowerCase() === "evaluated")),
  });

  const savedEvaluation = evalData?.data || evalData?.evaluation || evalData || null;

  React.useEffect(() => {
    if (savedEvaluation) {
      if (savedEvaluation.scores && Array.isArray(savedEvaluation.scores)) {
        const evalObj: Record<string, number> = {};
        savedEvaluation.scores.forEach((s: any) => {
          evalObj[s.description] = s.score;
        });
        setEvaluation(evalObj);
      } else if (typeof savedEvaluation === "object") {
        setEvaluation(savedEvaluation);
      }
      if (savedEvaluation.feedback) {
        setFeedback(savedEvaluation.feedback);
      }
    } else {
      setEvaluation({});
      setFeedback("");
    }
  }, [savedEvaluation]);

  const { data: votingPeriodsData, isPending: isLoadingVoting } = useQuery({
    queryKey: ["votingPeriods", contestId],
    queryFn: () => contestControllers.getAllVotingPeriods(contestId as string),
    enabled: !!contestId && mode !== "view",
  });

  const voteData = votingPeriodsData?.data || [];
  const judgeVotingPeriod = voteData?.find((vp: any) => vp.voting_type === "JUDGE" && vp.is_active) || voteData?.find((vp: any) => vp.voting_type === "JUDGE");
  const criteriaList = judgeVotingPeriod?.criteria || [];
  
  const isLoading = (mode === "view" && isLoadingEntry) || (mode !== "view" && isLoadingVoting);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const userStr = localStorage.getItem("user");
      const judgeId = userStr ? JSON.parse(userStr).id : "default";

      const scores = criteriaList.map((c: any) => ({
        score: evaluation[c.description] || 0,
        weighting: c.weighting,
        description: c.description
      }));

      const payload = {
        judge_id: judgeId,
        contest_id: contestId,
        voting_period_id: judgeVotingPeriod?.id,
        scores,
        feedback
      };

      if (mode === "edit" || evalData) {
        return judgeControllers.updateEvaluation(id as string, payload);
      } else {
        return judgeControllers.evaluateEntry(id as string, payload);
      }
    },
    onSuccess: () => {
      showSnackbar(mode === "edit" ? "Evaluation updated successfully!" : "Evaluation submitted successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["judge-entry", id] });
      queryClient.invalidateQueries({ queryKey: ["judge-evaluation", id] });
      router.push("/judge-panel/entries");
    },
    onError: (error: any) => {
      showSnackbar(error?.message || "Failed to submit evaluation", "error");
    }
  });

  const handleSubmit = () => {
    if (mode === "edit" || evalData) {
      let hasChanged = false;
      const originalScores: Record<string, number> = {};
      if (savedEvaluation?.scores) {
        savedEvaluation.scores.forEach((s: any) => {
          originalScores[s.description] = s.score;
        });
      }

      const newScoresObj = { ...evaluation };
      for (const key in newScoresObj) {
        if (newScoresObj[key] !== originalScores[key]) {
          hasChanged = true;
          break;
        }
      }
      if (!hasChanged) {
        for (const key in originalScores) {
          if (newScoresObj[key] !== originalScores[key]) {
            hasChanged = true;
            break;
          }
        }
      }

      const originalFeedback = savedEvaluation?.feedback || "";
      if (feedback !== originalFeedback) {
        hasChanged = true;
      }

      if (!hasChanged) {
        showSnackbar("Please update some fields before submitting", "warning");
        return;
      }
    }

    submitMutation.mutate();
  };

  const handleRatingChange = (name: string, value: number | null) => {
    setEvaluation(prev => ({ ...prev, [name]: value || 0 }));
  };

  const isFormValid = criteriaList.length > 0 ? criteriaList.every((c: any) => (evaluation[c.description] || 0) > 0) : false;

  const entryFields = entry?.contest?.entry_level_template?.schema?.fields || entry?.contest?.entryLevelTemplate?.schema?.fields || [];
  const userFields = entry?.contest?.userLevelTemplate?.schema?.fields || entry?.contest?.user_level_template?.schema?.fields || [];
  const template_fields = [...entryFields, ...userFields];

  let titleField = entryFields.find((f: any) => f.label?.toLowerCase().includes("title") || f.label?.toLowerCase().includes("project") || f.label?.toLowerCase().includes("startup"));
  if (!titleField) {
    titleField = userFields.find((f: any) => f.label?.toLowerCase().includes("name"));
  }

  let entryTitle = "Untitled Entry";
  const data = entry?.submission?.data;

  if (data) {
    if (titleField && data[titleField.id]) {
      entryTitle = data[titleField.id];
    } else if (data["ho1p00z0q"]) {
      entryTitle = data["ho1p00z0q"];
    } else {
      for (const f of entryFields) {
        const val = data[f.id];
        if (val && typeof val === 'string' && val.trim() !== '' && !/^[0-9+\-\s()]+$/.test(val) && val.length < 60) {
          entryTitle = val;
          break;
        }
      }
      
      if (entryTitle === "Untitled Entry") {
        const values = Object.values(data).filter(v => 
          typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('T18:30:00') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v as string)
        );
        if (values.length > 0) {
          entryTitle = values[0] as string;
        }
      }
    }
  }

  const groupedFields = React.useMemo(() => {
    if (!entry?.submission?.data) return [];
    const submissionData = entry.submission.data;
    const groups: { title: string; fields: { id: string; label: string; value: any; type: string }[] }[] = [];
    let currentGroup = { title: "General Information", fields: [] as { id: string; label: string; value: any; type: string }[] };
    const mappedFieldIds = new Set<string>();

    template_fields?.forEach((field: any) => {
      if (field.type === "step_break") {
        if (currentGroup.fields.length > 0 || currentGroup.title !== "General Information") {
          groups.push(currentGroup);
        }
        currentGroup = { title: field.label, fields: [] };
      } else {
        const value = submissionData[field.id];
        currentGroup.fields.push({
          id: field.id,
          label: field.label,
          value: value !== undefined ? value : "",
          type: field.type,
        });
        mappedFieldIds.add(field.id);
      }
    });

    if (currentGroup.fields.length > 0 || currentGroup.title !== "General Information") {
      groups.push(currentGroup);
    }

    const extraFields = Object.entries(submissionData).filter(([key]) => !mappedFieldIds.has(key) && key !== "status" && key !== "data");
    if (extraFields.length > 0) {
      groups.push({
        title: "Additional Details",
        fields: extraFields.map(([key, value]) => ({ id: key, label: key, value, type: "textfield" })),
      });
    }

    return groups.filter((g) => g.fields.some((f) => f.value !== "" && f.value !== null && f.value !== undefined));
  }, [entry, template_fields]);

  if (isLoading) {
    return (
      <JudgePanelLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress />
        </Box>
      </JudgePanelLayout>
    );
  }

  if (mode === "view" && !entry) {
    return (
      <JudgePanelLayout>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Entry not found</Typography>
          <Button variant="contained" onClick={() => router.back()} startIcon={<ArrowBack />}>Go Back</Button>
        </Box>
      </JudgePanelLayout>
    );
  }

  return (
    <JudgePanelLayout>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Breadcrumb
          title={mode === 'edit' ? 'Edit Evaluation' : mode === 'evaluate' ? 'Evaluate Entry' : 'Entry Details'}
          data={[
            { title: "Dashboard", href: "/judge-panel/dashboard" },
            { title: "My Entries", href: "/judge-panel/entries" },
            { title: mode === 'edit' ? 'Edit Evaluation' : mode === 'evaluate' ? 'Evaluate' : 'Details', href: "#" },
          ]}
        />
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          variant="outlined"
          sx={{ borderColor: colors.PRIMARY, color: colors.PRIMARY, textTransform: "none", fontWeight: 600, "&:hover": { borderColor: colors.SECONDARY, bgcolor: "rgba(99, 102, 241, 0.04)" } }}
        >
          Back to List
        </Button>
      </Box>

      {mode === 'view' && (
        <>
          <EntryHeroCard entry={entry} entryTitle={entryTitle} colors={colors} />
          <SubmissionDetails groupedFields={groupedFields} colors={colors} />
        </>
      )}

      {mode === 'view' && evalData && (
        <>
          <EvaluationSummary evalData={evalData} colors={colors} />
          <EvaluationHistory evalData={evalData} colors={colors} />
        </>
      )}

      {mode !== 'view' && (
        <EvaluationForm 
          criteriaList={criteriaList} 
          evaluation={evaluation} 
          feedback={feedback} 
          evalData={evalData} 
          entry={entry} 
          colors={colors} 
          isFormValid={isFormValid} 
          submitMutation={submitMutation} 
          mode={mode} 
          handleRatingChange={handleRatingChange} 
          setFeedback={setFeedback} 
          handleSubmit={handleSubmit}
        />
      )}
    </JudgePanelLayout>
  );
};

export default JudgeEntryDetailsPage;
