"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { Box, Button, Card, Divider, Typography, CircularProgress } from "@mui/material";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import { useAppTheme } from "@/context/ThemeContext";
import { getBaseEmailTemplate } from "@/utils/emailTemplates/baseTemplate";
import { montserrat } from "@/utils/fonts";

const ViewTemplate = () => {
  const router = useRouter();
  const params = useParams();
  const contestId = params?.id as string;
  const templateId = params?.templateId as string;
  const { colors } = useAppTheme();
  
  const { templates } = useNotificationTemplates();
  const template = templates.find(t => t.id === templateId);

  if (!template && templates.length > 0) {
    return <Box p={4} textAlign="center"><Typography>Template not found.</Typography></Box>;
  }
  
  if (templates.length === 0) {
    return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  }

  const getPreviewHtml = (rawBody: string, rawSubject: string) => {
    let htmlContent = getBaseEmailTemplate(rawBody, rawSubject, "{{contest_name}}");
    htmlContent = htmlContent
      .replace(/{{user_name}}/g, "John Doe")
      .replace(/{{contest_name}}/g, "Global Innovation Hackathon")
      .replace(/{{entry_title}}/g, "AI Smart Assistant");
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
           <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>{template?.eventType}</Typography>

           <Divider sx={{ mb: 3 }} />

           <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 700, textTransform: "uppercase" }}>Subject</Typography>
           <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontFamily: montserrat.style.fontFamily }}>{template?.subject}</Typography>

           <Divider sx={{ mb: 3 }} />

           <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 700, textTransform: "uppercase" }}>Body Preview</Typography>
           <Box 
             sx={{ mt: 1, p: 3, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}
             dangerouslySetInnerHTML={{ __html: getPreviewHtml(template?.body || "", template?.subject || "") }}
           />
        </Card>
      </Box>
    </Box>
  );
};

export default ViewTemplate;
