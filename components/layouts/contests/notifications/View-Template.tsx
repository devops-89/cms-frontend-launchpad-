"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { Box, Button, Card, Divider, Typography, CircularProgress } from "@mui/material";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import { useAppTheme } from "@/context/ThemeContext";
import { getBaseEmailTemplate } from "@/utils/emailTemplates/baseTemplate";
import { montserrat } from "@/utils/fonts";
import { useContestDetails } from "@/store/useContestDetails";
import moment from "moment";

const ViewTemplate = () => {
  const router = useRouter();
  const params = useParams();
  const contestId = params?.id as string;
  const templateId = params?.templateId as string;
  const { colors } = useAppTheme();
  
  const { contest } = useContestDetails();
  const { templates, isLoading } = useNotificationTemplates();
  const template = templates.find(t => t.id === templateId);

  if (isLoading) {
    return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  }

  if (!template) {
    return <Box p={4} textAlign="center"><Typography>Template not found.</Typography></Box>;
  }

  const getPreviewHtml = (rawBody: string, rawSubject: string) => {
    const contestName = contest?.name || "Your Contest";
    // For preview, we substitute the placeholders with actual contest data where possible,
    // and fallback to sample data for participant-specific fields.
    
    let htmlContent = rawBody;
    if (!htmlContent.includes('id="cms-email-inner-body"')) {
      htmlContent = getBaseEmailTemplate(rawBody, rawSubject, contestName);
    } else {
      // It's already wrapped (meaning it was saved via the new logic).
      // Replace the placeholder contest_name manually so it previews correctly.
      htmlContent = htmlContent.replace(/{{contest_name}}/g, contestName);
    }
    
    htmlContent = htmlContent
      .replace(/{{user_name}}/g, "John Doe")
      .replace(/{{participant_name}}/g, "John Doe")
      .replace(/{{contest_name}}/g, contestName)
      .replace(/{{entry_title}}/g, "Sample Entry Title")
      .replace(/{{entry_id}}/g, "ENT-123456")
      .replace(/{{end_date}}/g, contest?.end_date ? moment(contest.end_date).format("MMMM Do, YYYY") : "the deadline");
      
    return htmlContent;
  };

  return (
    <Box>
      <Box mb={4}>
        <Breadcrumb
          title="Template Details"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Contest Management", href: "/contest-management/contests" },
            { title: "Contest Details", href: `/contest-management/contests/${contestId}?tab=5` },
            { title: "Template Details", href: "#" },
          ]}
        />
      </Box>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
           <Button
             variant="outlined"
             onClick={() => router.push(`/contest-management/contests/${contestId}?tab=5`)}
             sx={{ textTransform: "none", minWidth: "120px" }}
           >
             Back to List
           </Button>
        </Box>
        <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.BORDER}` }}>
           <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 700, textTransform: "uppercase" }}>Event Type</Typography>
           <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>{template?.eventType?.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Typography>

           <Divider sx={{ mb: 3 }} />

           <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 700, textTransform: "uppercase" }}>Subject</Typography>
           <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontFamily: montserrat.style.fontFamily }}>{template?.subject}</Typography>

           <Divider sx={{ mb: 3 }} />

           <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 700, textTransform: "uppercase" }}>Body Preview</Typography>
           <Box 
             sx={{ 
               mt: 1, 
               p: 3, 
               bgcolor: "#f8fafc", 
               borderRadius: 2, 
               border: "1px dashed #cbd5e1",
               overflowX: "auto",
               "& *": {
                 wordBreak: "break-word",
               }
             }}
             dangerouslySetInnerHTML={{ __html: getPreviewHtml(template?.body || "", template?.subject || "") }}
           />
        </Card>
      </Box>
    </Box>
  );
};

export default ViewTemplate;
