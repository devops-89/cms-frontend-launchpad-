"use client";
import Image from "next/image";

import {
  AccountCircle,
  ArrowBack,
  CalendarToday,
  CheckCircle,
  Close,
  Download,
  EmojiEvents,
  Image as ImageIcon,
  Info,
  InsertDriveFile,
  Mail,
  Phone,
  Star,
  Tune,
  Videocam,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Rating,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";
import { judgeControllers } from "@/api/judgeControllers";
import JudgePanelLayout from "@/components/layouts/JudgePanel";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";

import EntryDetailsSection from "@/components/layouts/entry-details/EntryDetailsSection";
import EntryHeroSection from "@/components/layouts/entry-details/EntryHeroSection";
import InnovationVideoPlayer, { VideoPlayerRenderer } from "@/components/layouts/entry-details/InnovationVideoPlayer";
import TeamMembersSection from "@/components/layouts/entry-details/TeamMembersSection";

import { EvaluationForm } from "@/components/layouts/JudgePanel/components/EvaluationForm";
import { EvaluationHistory } from "@/components/layouts/JudgePanel/components/EvaluationHistory";
import { EvaluationSummary } from "@/components/layouts/JudgePanel/components/EvaluationSummary";

const JudgeEntryDetailsPage = () => {
  const [selectedMemberGroup, setSelectedMemberGroup] = React.useState<any>(null);
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
    enabled: !!id && (mode === "edit" || mode === "view"),
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
      const userStr = localStorage.getItem("judge_user");
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

  const template_fields = React.useMemo(() => {
    return entry?.contest?.entryLevelTemplate?.schema?.fields ||
           entry?.contest?.entry_level_template?.schema?.fields ||
           [];
  }, [entry]);

  const getFieldIcon = (type: string, label: string) => {
    const lowercaseLabel = label?.toLowerCase() || "";
    if (lowercaseLabel.includes("phone") || lowercaseLabel.includes("mobile") || type === "telInput") return <Phone sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("email") || lowercaseLabel.includes("mail")) return <Mail sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("date") || lowercaseLabel.includes("dob") || lowercaseLabel.includes("birth") || type === "datePicker") return <CalendarToday sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("rating") || type === "rating") return <Star sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("score") || lowercaseLabel.includes("points")) return <EmojiEvents sx={{ fontSize: 20 }} />;
    if (type === "checkbox" || type === "switch") return <CheckCircle sx={{ fontSize: 20 }} />;
    if (type === "slider") return <Tune sx={{ fontSize: 20 }} />;
    if (type === "file_upload" || lowercaseLabel.includes("video")) {
      if (lowercaseLabel.includes("video")) return <Videocam sx={{ fontSize: 20 }} />;
      if (lowercaseLabel.includes("image") || lowercaseLabel.includes("photo")) return <ImageIcon sx={{ fontSize: 20 }} />;
      return <InsertDriveFile sx={{ fontSize: 20 }} />;
    }
    if (lowercaseLabel.includes("name") || lowercaseLabel.includes("member") || lowercaseLabel.includes("father")) return <AccountCircle sx={{ fontSize: 20 }} />;
    return <Info sx={{ fontSize: 20 }} />;
  };

  const renderFieldValue = (field: any) => {
    const { type, value } = field;

    if (value === undefined || value === null || value === "") {
      return (
        <Typography
          variant="body2"
          sx={{ color: "text.disabled", fontStyle: "italic", mt: 0.5 }}
        >
          Not specified
        </Typography>
      );
    }

    if (type === "rating") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
          <Rating value={Number(value)} readOnly precision={0.5} size="small" />
          <Typography
            variant="caption"
            sx={{ ml: 1, fontWeight: 600, color: colors.TEXT_SECONDARY }}
          >
            ({value})
          </Typography>
        </Box>
      );
    }

    if (type === "checkbox" || type === "switch") {
      const isTrue =
        value === true ||
        String(value).toLowerCase() === "true" ||
        value === "Yes";
      return (
        <Chip
          label={isTrue ? "Yes" : "No"}
          size="small"
          sx={{
            mt: 0.5,
            fontWeight: 600,
            fontSize: "0.75rem",
            bgcolor: isTrue
              ? "rgba(16, 185, 129, 0.1)"
              : "rgba(100, 116, 139, 0.1)",
            color: isTrue ? "#10b981" : "#64748b",
            border: `1px solid ${
              isTrue ? "rgba(16, 185, 129, 0.2)" : "rgba(100, 116, 139, 0.2)"
            }`,
          }}
        />
      );
    }

    if (type === "datePicker") {
      try {
        return (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY, mt: 0.5 }}
          >
            {new Date(value).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        );
      } catch (e) {
        return (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY, mt: 0.5 }}
          >
            {String(value)}
          </Typography>
        );
      }
    }

    if (type === "file_upload") {
      if (!value) return null;
      const urlStr = typeof value === 'string' ? value : String(value);
      const urlWithoutQuery = urlStr.split('?')[0];
      const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();
      const isImage = typeof urlStr === 'string' && urlStr.match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i);
      const isVideo = ['mp4', 'mov', 'mkv', 'webm', 'ogg'].includes(extension || "");

      const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
          const response = await fetch(urlStr);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          const objectUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          const urlParts = urlStr.split('?')[0].split('/');
          const filename = urlParts[urlParts.length - 1] || 'download';
          a.download = decodeURIComponent(filename);
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.error("Download failed, opening in new tab:", error);
          window.open(urlStr, "_blank");
        }
      };

      return (
        <Box sx={{ mt: 1, display: 'flex', flexDirection: isVideo ? 'column' : { xs: 'column', sm: 'row' }, alignItems: isVideo ? 'stretch' : 'center', gap: 2, p: 2, border: `1px solid ${colors.BORDER}`, borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          {isVideo ? (
            <VideoPlayerRenderer urlStr={urlStr} />
          ) : isImage ? (
            <Box sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: `1px solid ${colors.BORDER}`, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <Image src={urlStr} alt="Uploaded file" fill style={{ objectFit: "cover" }} sizes="80px" />
            </Box>
          ) : (
            <Box sx={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2, color: colors.PRIMARY, flexShrink: 0 }}>
              <InsertDriveFile sx={{ fontSize: 36 }} />
            </Box>
          )}
          {!isVideo && (
            <Box sx={{ flexGrow: 1, minWidth: 0, pl: 1 }}>
               <Typography variant="body1" noWrap sx={{ display: 'block', fontWeight: 700, color: colors.TEXT_PRIMARY }}>
                 {isImage ? "Image File" : "Document File"}
               </Typography>
               <Button variant="outlined" size="small" onClick={handleDownload} startIcon={<Download />} sx={{ mt: 1, textTransform: 'none', py: 0.5, px: 2, fontSize: '0.85rem', borderRadius: 2, fontWeight: 600 }}>
                 Download File
               </Button>
            </Box>
          )}
          {isVideo && (
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", width: "100%", maxWidth: 600, gap: 2, px: 1 }}>
               <Typography variant="h6" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
                 Video Attachment
               </Typography>
               <Button variant="contained" size="large" onClick={handleDownload} startIcon={<Download />} sx={{ textTransform: 'none', py: 1, px: 3, borderRadius: 3, fontWeight: 700, boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)", flexShrink: 0 }}>
                 Download Video
               </Button>
            </Box>
          )}
        </Box>
      );
    }

    const stringValue = String(value);
    const isUrl = stringValue.startsWith("http://") || stringValue.startsWith("https://") || stringValue.startsWith("www.");
    const hrefValue = stringValue.startsWith("www.") ? `https://${stringValue}` : stringValue;

    return (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: isUrl ? colors.PRIMARY : colors.TEXT_PRIMARY,
          wordBreak: "break-word",
          mt: 0.5,
        }}
      >
        {isUrl ? (
          <a href={hrefValue} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
            {stringValue}
          </a>
        ) : (
          stringValue
        )}
      </Typography>
    );
  };

  const groupedFields = React.useMemo(() => {
    if (!entry?.submission?.data) return [];

    const submissionData = entry.submission.data;
    const groups: {
      title: string;
      fields: { id: string; label: string; value: any; type: string }[];
    }[] = [];

    let currentGroup = {
      title: "General Information",
      fields: [] as { id: string; label: string; value: any; type: string }[],
    };

    const mappedFieldIds = new Set<string>();

    template_fields?.forEach((field: any) => {
      if (field.type === "step_break") {
        if (
          currentGroup.fields.length > 0 ||
          currentGroup.title !== "General Information"
        ) {
          groups.push(currentGroup);
        }
        currentGroup = {
          title: field.label,
          fields: [],
        };
      } else {
        if (field.type === "textblock" || field.type === "checkbox") return;
        const labelTrimmed = field.label?.trim() || "";
        const downloadUrl = submissionData[`${labelTrimmed}_downloadUrl`] || submissionData[`${field.label}_downloadUrl`] || submissionData[`${field.id}_downloadUrl`];
        const value = downloadUrl || submissionData[labelTrimmed] || submissionData[field.label] || submissionData[field.id];
        currentGroup.fields.push({
          id: field.id,
          label: field.label,
          value: value !== undefined ? value : "",
          type: field.type,
        });
        mappedFieldIds.add(field.id);
      }
    });

    if (
      currentGroup.fields.length > 0 ||
      currentGroup.title !== "General Information"
    ) {
      groups.push(currentGroup);
    }

    const mappedFieldKeys = new Set<string>();
    template_fields?.forEach((f: any) => {
      mappedFieldKeys.add(f.id);
      mappedFieldKeys.add(f.label);
      if (f.label) mappedFieldKeys.add(f.label.trim());
    });

    groups.forEach((group) => {
      const firstNameFieldIdx = group.fields.findIndex(
        (f) => f.label.toLowerCase().replace(/\s/g, "") === "firstname" || f.id.toLowerCase().replace(/\s/g, "") === "firstname"
      );
      const lastNameFieldIdx = group.fields.findIndex(
        (f) => f.label.toLowerCase().replace(/\s/g, "") === "lastname" || f.id.toLowerCase().replace(/\s/g, "") === "lastname"
      );

      if (firstNameFieldIdx !== -1 && lastNameFieldIdx !== -1) {
        const firstName = group.fields[firstNameFieldIdx].value;
        const lastName = group.fields[lastNameFieldIdx].value;

        const fullNameField = {
          id: "fullName_combined",
          label: "Full Name",
          value: `${firstName} ${lastName}`.trim(),
          type: "text",
        };

        group.fields.splice(firstNameFieldIdx, 1, fullNameField);

        const newLastNameFieldIdx = group.fields.findIndex(
          (f) => f.label.toLowerCase().replace(/\s/g, "") === "lastname" || f.id.toLowerCase().replace(/\s/g, "") === "lastname"
        );
        if (newLastNameFieldIdx !== -1) {
          group.fields.splice(newLastNameFieldIdx, 1);
        }
      }
    });

    return groups.filter((g) =>
      g.fields.some(
        (f) => f.value !== "" && f.value !== null && f.value !== undefined
      )
    );
  }, [entry?.submission?.data, template_fields]);

  if (isLoading) {
    return (
      <JudgePanelLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </JudgePanelLayout>
    );
  }

  if (mode === "view" && !entry) {
    return (
      <JudgePanelLayout>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Entry not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.back()}
            startIcon={<ArrowBack />}
          >
            Go Back
          </Button>
        </Box>
      </JudgePanelLayout>
    );
  }

  return (
    <JudgePanelLayout>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
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
          sx={{
            borderRadius: 2,
            borderColor: colors.PRIMARY,
            color: colors.PRIMARY,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              borderColor: colors.SECONDARY,
              bgcolor: "rgba(99, 102, 241, 0.04)",
            },
          }}
        >
          Back to List
        </Button>
      </Box>

      {mode === 'view' && entry && (
        <>
          <EntryHeroSection entry={entry} colors={colors} showStatus />

          {(() => {
            let youtubeUrl = "";
            for (const group of groupedFields) {
              for (const field of group.fields) {
                if (field.label?.toLowerCase().includes("youtube") || field.label?.toLowerCase().includes("video link")) {
                  if (field.value && typeof field.value === 'string' && field.value.includes('http')) {
                    youtubeUrl = field.value;
                  }
                }
              }
            }

            let videoId = null;
            if (youtubeUrl) {
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
              const match = youtubeUrl.match(regExp);
              videoId = (match && match[2].length === 11) ? match[2] : null;
            }

            const otherGroups = groupedFields.filter((g: any) => g.title !== "General Information" && !g.title?.toLowerCase().includes("member"));
            const memberGroups = groupedFields.filter((g: any) => g.title?.toLowerCase().includes("member"));
            const participantEmail = Object.values(entry?.participant?.submission?.data || {}).find(v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) as string | undefined;

            return (
              <>
                <InnovationVideoPlayer videoId={videoId} colors={colors} />
                <TeamMembersSection memberGroups={memberGroups} colors={colors} participantEmail={participantEmail} renderFieldValue={renderFieldValue} />
                <EntryDetailsSection otherGroups={otherGroups} colors={colors} videoId={videoId} memberGroupsLength={memberGroups.length} getFieldIcon={getFieldIcon} renderFieldValue={renderFieldValue} />
              </>
            );
          })()}
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

      <Dialog open={Boolean(selectedMemberGroup)} onClose={() => setSelectedMemberGroup(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, pt: 3 }}>
          <Typography component="div" variant="h5" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
            {selectedMemberGroup?.title}
          </Typography>
          <IconButton onClick={() => setSelectedMemberGroup(null)} sx={{ color: colors.TEXT_SECONDARY }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.BORDER, p: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {selectedMemberGroup?.fields
              ?.filter((field: any) => !field.label?.toLowerCase().includes("do you want to add another"))
              .map((field: any, idx: number, arr: any[]) => (
              <Box key={field.id} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, py: 2.5, px: 3, borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${colors.BORDER}`, "&:hover": { bgcolor: "rgba(99, 102, 241, 0.04)" }, gap: { xs: 1, sm: 3 } }}>
                <Typography variant="body2" sx={{ width: { xs: "100%", sm: "40%" }, color: colors.TEXT_SECONDARY, fontWeight: 700 }}>
                  {field.label}
                </Typography>
                <Box sx={{ width: { xs: "100%", sm: "60%" } }}>
                  {renderFieldValue(field)}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="contained" onClick={() => setSelectedMemberGroup(null)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: colors.PRIMARY, '&:hover': { bgcolor: colors.SECONDARY } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </JudgePanelLayout>
  );
};

export default JudgeEntryDetailsPage;