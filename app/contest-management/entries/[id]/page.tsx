"use client";
import Image from "next/image";

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
  Download,
  InsertDriveFile,
  HowToVote,
  PlayCircleOutline,
  Videocam,
  Image as ImageIcon
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Rating,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { entryControllers } from "@/api/entryControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";

const VideoPlayerRenderer = ({ urlStr }: { urlStr: string }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', width: "100%", maxWidth: 600, height: 340, borderRadius: 3, overflow: 'hidden', 
        flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)', bgcolor: "#000",
        display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}
    >
      <video 
        ref={videoRef}
        src={urlStr} 
        controls={isPlaying} 
        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
        preload="metadata" 
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      {!isPlaying && (
        <Box 
          onClick={handlePlay}
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            bgcolor: 'rgba(0,0,0,0.3)', cursor: 'pointer',
            "&:hover .play-icon": { transform: "scale(1.1)", color: "#fff" }
          }}
        >
          <PlayCircleOutline className="play-icon" sx={{ fontSize: 64, color: "rgba(255,255,255,0.8)", transition: "all 0.2s ease" }} />
        </Box>
      )}
    </Box>
  );
};

const EntryDetailsPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contestId");
  const router = useRouter();
  const { colors } = useAppTheme();

  const { data: entryData, isPending: isEntryLoading } = useQuery({
    queryKey: ["entry", id],
    queryFn: () => entryControllers.getEntryById(contestId as string, id as string),
    enabled: !!contestId && !!id,
  });

  const isLoading = isEntryLoading;
  const entry = entryData?.data;
  const effectiveContestId = contestId;

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
    );
  }

  if (!entry) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
        }}
      >
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
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
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
          title={`Entry Details`}
          data={[
            {
              title: "Dashboard",
              href: "/dashboard",
            },
            {
              title: "Contests",
              href: "/contest-management/contests",
            },
            {
              title: "Contest Details",
              href: `/contest-management/contests/${effectiveContestId}`,
            },
            {
              title: "Entry Details",
              href: "#",
            },
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

      {/* Main Entry Hero Card */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: `1px solid ${colors.BORDER}`,
          background: `linear-gradient(135deg, ${colors.SURFACE} 0%, rgba(99, 102, 241, 0.02) 100%)`,
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
          mb: 5,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <Grid container spacing={4} alignItems="center">
          <Grid
            size={{ xs: 12, sm: 4, md: 3, lg: 2 }}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Avatar
              variant="rounded"
              src={(() => {
                const submissionData = entry?.submission?.data || {};
                const entryFields = entry?.contest?.entryLevelTemplate?.schema?.fields || entry?.contest?.entry_level_template?.schema?.fields || [];
                const thumbnailField = entryFields?.find((f: any) => f.label?.toLowerCase().includes("thumbnail"));
                let thumbnailUrl = "";
                if (thumbnailField) {
                  thumbnailUrl = submissionData[`${thumbnailField.id}_downloadUrl`] || submissionData[`${thumbnailField.label}_downloadUrl`] || submissionData[thumbnailField.id] || submissionData[thumbnailField.label] || "";
                }
                if (!thumbnailUrl) {
                  const downloadUrlKey = Object.keys(submissionData).find((key) => key.endsWith("_downloadUrl"));
                  thumbnailUrl = downloadUrlKey ? submissionData[downloadUrlKey] : "";
                }
                if (!thumbnailUrl) {
                  const imageUrlKey = Object.keys(submissionData).find((key) => {
                    if (key === "status" || key.endsWith("_downloadUrl")) return false;
                    const val = submissionData[key];
                    return typeof val === "string" && /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(val);
                  });
                  if (imageUrlKey) thumbnailUrl = submissionData[imageUrlKey];
                }
                return thumbnailUrl;
              })()}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.PRIMARY} 0%, ${colors.SECONDARY} 100%)`,
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.2)",
              }}
            >
              <EmojiEvents sx={{ fontSize: 60, color: "#fff" }} />
            </Avatar>
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 9, lg: 10 }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 3,
                mb: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: colors.TEXT_PRIMARY,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                {(() => {
                  const sData = entry?.submission?.data || {};
                  const entryFields = entry?.contest?.entryLevelTemplate?.schema?.fields || entry?.contest?.entry_level_template?.schema?.fields || [];
                  const entryTitleField = entryFields?.find((f: any) => {
                    const l = f.label?.toLowerCase() || "";
                    return l.includes("title") || l.includes("project");
                  });

                  let entryTitle = "";
                  if (entryTitleField && sData) {
                    entryTitle = sData[entryTitleField.label] || sData[entryTitleField.id];
                  }
                  if (!entryTitle) {
                    entryTitle = sData?.name_1 || sData?.ho1p00z0q || sData?.["Innovation Title"] || sData?.zvdskzwrw;
                  }
                  if (!entryTitle) {
                    const values = Object.entries(sData)
                      .filter(([k, v]: [string, any]) => !["status", "isdraft"].includes(k.toLowerCase()) && typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v))
                      .map(([k, v]) => v);
                    if (values.length > 0) entryTitle = values[0] as string;
                  }
                  return entryTitle || "Untitled Entry";
                })()}
              </Typography>

              <Chip
                icon={
                  <EmojiEvents
                    sx={{ fontSize: "16px !important", color: "#fff !important" }}
                  />
                }
                label={`Score: ${entry.score}`}
                sx={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
                  border: "none",
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
              {["semifinal", "final", "winner"].includes(entry.status?.toLowerCase()) && (
                <Chip
                  icon={
                    <HowToVote
                      sx={{ fontSize: "16px !important", color: "#fff !important" }}
                    />
                  }
                  label={`Total Public Vote: ${entry.voteCount || 0}`}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                    border: "none",
                    "& .MuiChip-label": { px: 1.5 },
                  }}
                />
              )}
            </Box>

            <Typography
              variant="body1"
              sx={{ color: colors.TEXT_SECONDARY, mb: 3, fontWeight: 500 }}
            >
              Submitted by:{" "}
              <Box
                component="span"
                sx={{ color: colors.TEXT_PRIMARY, fontWeight: 700 }}
              >
                {(() => {
                  const rawAuthorData = entry?.participant?.submission?.data;
                  const authorData = rawAuthorData?.data || rawAuthorData || (entry?.participant as any)?.data || (entry?.participant as any)?.participant_profile_data || {};
                  const userFields = entry?.contest?.userLevelTemplate?.schema?.fields || entry?.contest?.user_level_template?.schema?.fields || [];
                  
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

                  let participantName = "";

                  if (firstNameField || lastNameField) {
                    const first = firstNameField ? (authorData[firstNameField.label] || authorData[firstNameField.id]) : "";
                    const last = lastNameField ? (authorData[lastNameField.label] || authorData[lastNameField.id]) : "";
                    participantName = `${first || ""} ${last || ""}`.trim();
                  }
                  
                  if (!participantName && fullNameField) {
                    participantName = authorData[fullNameField.label] || authorData[fullNameField.id];
                  }

                  if (!participantName && authorData && Object.keys(authorData).length > 0) {
                    const fallback = userFields.find((f: any) => f.label?.toLowerCase().includes("name"));
                    if (fallback && (authorData[fallback.label] || authorData[fallback.id])) {
                      participantName = authorData[fallback.label] || authorData[fallback.id];
                    } else {
                      participantName = authorData.yg9snrxlh || authorData.an7ffo0mu || authorData.qlon5xekd;
                    }
                  }

                  // FALLBACK: If participant is null or empty, check entry submission data itself!
                  if (!participantName && entry?.submission?.data) {
                    const sData = entry.submission.data;
                    const allFields = [...userFields, ...template_fields];
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
                      participantName = `${first || ""} ${last || ""}`.trim();
                    }
                    
                    if (!participantName) {
                       participantName = sData.yg9snrxlh || sData.an7ffo0mu || sData.qlon5xekd || sData.os28hf1aa;
                       if (participantName && sData.tlb9rveot) participantName += " " + sData.tlb9rveot;
                    }
                  }

                  if (!participantName && authorData && Object.keys(authorData).length > 0) {
                     const values = Object.values(authorData).filter((v: any) => typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v));
                     if (values.length > 0) participantName = values[0] as string;
                  }
                  
                  return participantName || "Unknown Participant";
                })()}
              </Box>
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.TEXT_SECONDARY,
                    display: "block",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    mb: 0.5,
                  }}
                >
                  Submission ID
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}
                >
                  {entry.id}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.TEXT_SECONDARY,
                    display: "block",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    mb: 0.5,
                  }}
                >
                  Submitted At
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}
                >
                  {new Date(entry.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {entry.status?.toLowerCase() === "rejected" && entry.rejectReason && (
          <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
            <Typography variant="subtitle2" sx={{ color: "#dc2626", fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info fontSize="small" /> Reason for Rejection
            </Typography>
            <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY, pl: 3 }}>{entry.rejectReason}</Typography>
          </Box>
        )}
      </Card>

      {/* Submission Details grouped by Step Breaks */}
      {groupedFields.map((group, gIdx) => (
        <Box key={gIdx} sx={{ mb: 5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, mt: gIdx !== 0 ? 2 : 0 }}>
            <Box
              sx={{
                width: 4,
                height: 24,
                borderRadius: 1,
                bgcolor: colors.PRIMARY,
                mt: 3
              }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY, mt: 3 }}
            >
              {group.title}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", bgcolor: colors.SURFACE, borderRadius: 4, border: `1px solid ${colors.BORDER}`, p: 1, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {group.fields.map((field: any, idx: number) => (
              <Box
                key={field.id}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  py: 3,
                  borderBottom: idx === group.fields.length - 1 ? 'none' : `1px solid ${colors.BORDER}`,
                  "&:hover": { bgcolor: "rgba(99, 102, 241, 0.04)" },
                  px: { xs: 3, sm: 4 },
                  gap: { xs: 1.5, sm: 0 },
                  transition: "background-color 0.3s ease"
                }}
              >
                <Box sx={{ width: { xs: "100%", sm: "35%", md: "30%" }, display: "flex", alignItems: "center", gap: 2.5, flexShrink: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 1.2, borderRadius: 2, bgcolor: "rgba(99, 102, 241, 0.08)", color: colors.PRIMARY, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
                    {getFieldIcon(field.type, field.label)}
                  </Box>
                  <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 700, letterSpacing: 0.5 }}>
                    {field.label}
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "65%", md: "70%" }, pl: { xs: 0, sm: 3 }, pt: { xs: 1, sm: 0 }, borderLeft: { xs: 'none', sm: `2px solid rgba(0,0,0,0.04)` } }}>
                  {renderFieldValue(field)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}

    </Box>
  );
};

export default EntryDetailsPage;