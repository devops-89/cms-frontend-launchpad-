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

import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";

const EntryDetailsPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contestId");
  const router = useRouter();
  const { colors } = useAppTheme();

  const { data: entryData, isPending } = useQuery({
    queryKey: ["entry", contestId, id],
    queryFn: () =>
      entryControllers.getEntryById(
        contestId as string,
        id as string
      ),
    enabled: !!contestId && !!id,
  });

  const entry = entryData?.data;

  const effectiveContestId = contestId || entry?.contest_id;

  const { data: contestData, isPending: isContestPending } = useQuery({
    queryKey: ["contest", effectiveContestId],
    queryFn: () =>
      contestControllers.getContestDetails(effectiveContestId as string),
    enabled: !!effectiveContestId,
  });

  const template_fields =
    contestData?.data?.entryLevelTemplate?.schema?.fields || [];

  const isLoading = isPending || (!!effectiveContestId && isContestPending);

  const getFieldIcon = (type: string, label: string) => {
    const lowercaseLabel = label.toLowerCase();
    if (
      lowercaseLabel.includes("phone") ||
      lowercaseLabel.includes("mobile") ||
      type === "telInput"
    )
      return <Phone sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("email") || lowercaseLabel.includes("mail"))
      return <Mail sx={{ fontSize: 20 }} />;
    if (
      lowercaseLabel.includes("date") ||
      lowercaseLabel.includes("dob") ||
      lowercaseLabel.includes("birth") ||
      type === "datePicker"
    )
      return <CalendarToday sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("rating") || type === "rating")
      return <Star sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("score") || lowercaseLabel.includes("points"))
      return <EmojiEvents sx={{ fontSize: 20 }} />;
    if (type === "checkbox" || type === "switch")
      return <CheckCircle sx={{ fontSize: 20 }} />;
    if (type === "slider") return <Tune sx={{ fontSize: 20 }} />;

    if (
      lowercaseLabel.includes("name") ||
      lowercaseLabel.includes("member") ||
      lowercaseLabel.includes("father")
    )
      return <AccountCircle sx={{ fontSize: 20 }} />;

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

    return (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: colors.TEXT_PRIMARY,
          wordBreak: "break-word",
          mt: 0.5,
        }}
      >
        {String(value)}
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

    if (
      currentGroup.fields.length > 0 ||
      currentGroup.title !== "General Information"
    ) {
      groups.push(currentGroup);
    }

    const extraFields = Object.entries(submissionData).filter(
      ([key]) => !mappedFieldIds.has(key)
    );

    if (extraFields.length > 0) {
      groups.push({
        title: "Additional Details",
        fields: extraFields.map(([key, value]) => ({
          id: key,
          label: key,
          value,
          type: "textfield",
        })),
      });
    }

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
                {entry?.submission?.data?.ho1p00z0q || "Untitled Entry"}
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
                {entry?.participant?.submission?.data?.yg9snrxlh ||
                  "Unknown Participant"}
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
      </Card>

      {/* Submission Details grouped by Step Breaks */}
      {groupedFields.map((group, gIdx) => (
        <Box key={gIdx} sx={{ mb: 5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, mt: gIdx !== 0 ? 2:0 }}>
            <Box
              sx={{
                width: 4,
                height: 24,
                borderRadius: 1,
                bgcolor: colors.PRIMARY,
                mt:3
              }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY,mt:3 }}
            >
              {group.title}
            </Typography>
          </Box>

          <Grid container spacing={{xs:2,md:3,lg:8}}>
            {group.fields.map((field) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={field.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${colors.BORDER}`,
                    background: colors.SURFACE,
                    height: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    transition: "all 0.25s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 24px -10px rgba(0,0,0,0.06)",
                      borderColor: colors.PRIMARY,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 1,
                      borderRadius: 2.5,
                      bgcolor: "rgba(99, 102, 241, 0.05)",
                      color: colors.PRIMARY,
                      flexShrink: 0,
                    }}
                  >
                    {getFieldIcon(field.type, field.label)}
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.TEXT_SECONDARY,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        display: "block",
                      }}
                    >
                      {field.label}
                    </Typography>

                    {renderFieldValue(field)}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default EntryDetailsPage;