"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { Box, Button, Grid, TextField, Select, MenuItem, InputLabel, FormControl, Chip, Tooltip, Typography, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import { ContentCopy } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";

const participantEvents = [
  "Registration Successful",
  "Entry Submitted",
  "Selected as Semi-Finalist",
  "Selected as Finalist",
  "Announced as Winner",
];

const judgeEvents = [
  "Assigned as Judge",
];

const EditTemplateForm = () => {
  const router = useRouter();
  const params = useParams();
  const contestId = params?.id as string;
  const templateId = params?.templateId as string;
  const { colors } = useAppTheme();
  
  const { templates, updateTemplate } = useNotificationTemplates();
  const template = templates.find(t => t.id === templateId);

  const [audience, setAudience] = useState<"Participant" | "Judge">("Participant");
  const [eventType, setEventType] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");

  useEffect(() => {
    if (template) {
      setAudience(template.audience);
      setEventType(template.eventType);
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [template]);

  if (!template && templates.length > 0) {
    return <Box p={4} textAlign="center"><Typography>Template not found.</Typography></Box>;
  }
  
  if (templates.length === 0) {
    return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  }

  const handleSave = () => {
    if (!eventType || !subject || !body) {
      alert("Please fill in all fields.");
      return;
    }

    updateTemplate(templateId, {
      audience,
      eventType,
      subject,
      body,
    });
    router.push(`/contest-management/contests/${contestId}?tab=5`);
  };

  const renderVariablesHelper = () => (
    <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(99, 102, 241, 0.05)", borderRadius: 2, border: `1px solid ${colors.BORDER}` }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Available Variables</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click to copy and paste these into your email subject or body.
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {["{{user_name}}", "{{contest_name}}", "{{entry_title}}"].map((variable) => (
          <Tooltip title="Copy to clipboard" key={variable}>
            <Chip
              label={variable}
              size="small"
              onClick={() => navigator.clipboard.writeText(variable)}
              icon={<ContentCopy sx={{ fontSize: 14 }} />}
              sx={{ cursor: "pointer", bgcolor: colors.SURFACE, border: `1px solid ${colors.BORDER}` }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Box mb={4}>
        <Breadcrumb
          title="Edit Template"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Contest Management", href: "/contest-management/contests" },
            { title: "Contest Details", href: `/contest-management/contests/${contestId}?tab=5` },
            { title: "Edit Template", href: "#" },
          ]}
        />
      </Box>

      <Box component="form" noValidate>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Audience</InputLabel>
              <Select
                value={audience}
                label="Audience"
                disabled
              >
                <MenuItem value="Participant">Participant</MenuItem>
                <MenuItem value="Judge">Judge</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventType}
                label="Event Type"
                disabled
              >
                {(audience === "Participant" ? participantEvents : judgeEvents).map((ev) => (
                  <MenuItem key={ev} value={ev}>{ev}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Email Subject"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Email Body"
              fullWidth
              multiline
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi {{user_name}}, welcome to {{contest_name}}..."
            />
            {renderVariablesHelper()}
          </Grid>
          <Grid size={12}>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/contest-management/contests/${contestId}?tab=5`)}
                sx={{ textTransform: "none", minWidth: "120px" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "16px",
                  minWidth: "150px",
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default EditTemplateForm;
