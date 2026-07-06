"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { Box, Button, Grid, TextField, Select, MenuItem, InputLabel, FormControl, Chip, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import { ContentCopy } from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { getBaseEmailTemplate } from "@/utils/emailTemplates/baseTemplate";

import { TEMPLATE_EVENT_TYPE } from "@/types/user";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const participantEvents = [
  { value: TEMPLATE_EVENT_TYPE.REGISTRATION_SUCCESSFUL, label: "Registration Successful" },
  { value: TEMPLATE_EVENT_TYPE.ENTRY_SUBMITTED, label: "Entry Submitted" },
  { value: TEMPLATE_EVENT_TYPE.SELECTED_AS_SEMI_FINALIST, label: "Selected as Semi-Finalist" },
  { value: TEMPLATE_EVENT_TYPE.SELECTED_AS_FINALIST, label: "Selected as Finalist" },
  { value: TEMPLATE_EVENT_TYPE.ANNOUNCED_AS_WINNER, label: "Announced as Winner" },
];

const judgeEvents = [
  { value: TEMPLATE_EVENT_TYPE.ASSIGNED_AS_JUDGE, label: "Assigned as Judge" },
];

const AddTemplateForm = () => {
  const router = useRouter();
  const params = useParams();
  const contestId = params?.id as string;
  const { colors } = useAppTheme();
  const { addTemplate } = useNotificationTemplates();
  const { showSnackbar } = useSnackbar();

  const [audience, setAudience] = useState<"Participant" | "Judge">("Participant");
  const [eventType, setEventType] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleSave = async () => {
    const newErrors = {
      eventType: !eventType,
      subject: !subject.trim(),
      body: !body.trim() || body.trim() === "<p><br></p>",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      showSnackbar("Please fill in all required fields.", "error");
      return;
    }

    try {
      const wrappedBody = getBaseEmailTemplate(body, subject, "{{contest_name}}");
      
      await addTemplate({
        audience,
        eventType,
        subject,
        body: wrappedBody,
      });
      showSnackbar("Template created successfully", "success");
      router.push(`/contest-management/contests/${contestId}?tab=5`);
    } catch (error) {
      showSnackbar("Failed to create template", "error");
    }
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
          title="Add Template"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Contest Management", href: "/contest-management/contests" },
            { title: "Contest Details", href: `/contest-management/contests/${contestId}?tab=5` },
            { title: "Add Template", href: "#" },
          ]}
        />
      </Box>

      <Box component="form" noValidate>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>User</InputLabel>
              <Select
                value={audience}
                label="User"
                onChange={(e) => {
                  setAudience(e.target.value as "Participant" | "Judge");
                  setEventType("");
                }}
              >
                <MenuItem value="Participant">Participant</MenuItem>
                <MenuItem value="Judge">Judge</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth error={errors.eventType}>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventType}
                label="Event Type"
                onChange={(e) => {
                  setEventType(e.target.value);
                  setErrors((prev) => ({ ...prev, eventType: false }));
                }}
              >
                {(audience === "Participant" ? participantEvents : judgeEvents).map((ev) => (
                  <MenuItem key={ev.value} value={ev.value}>{ev.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Email Subject"
              fullWidth
              error={errors.subject}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setErrors((prev) => ({ ...prev, subject: false }));
              }}
            />
          </Grid>
          <Grid size={12}>
            <InputLabel sx={{ mb: 1, fontSize: "0.875rem", color: errors.body ? "error.main" : colors.TEXT_SECONDARY }}>Email Body</InputLabel>
            <Box sx={{ 
              "& .quill": { bgcolor: "white", borderRadius: 1, border: errors.body ? "1px solid red" : "none" },
              "& .ql-container": { minHeight: "250px", fontSize: "16px", fontFamily: "inherit" },
              "& .ql-editor": { minHeight: "250px" }
            }}>
              <ReactQuill
                theme="snow"
                value={body}
                onChange={setBody}
                placeholder="Hi {{user_name}}, welcome to {{contest_name}}..."
              />
            </Box>
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
                Create Template
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AddTemplateForm;
