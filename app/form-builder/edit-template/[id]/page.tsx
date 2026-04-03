"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FormBuilder from "@/components/layouts/form-builder/FormBuilder";
import { FORM_CONTROLLERS } from "@/api/formControllers";
import { Box, CircularProgress, Typography, alpha, useTheme } from "@mui/material";

const EditTemplatePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const theme = useTheme();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await FORM_CONTROLLERS.getTemplateById(id as string);
        // Robust data extraction: check if payload is wrapped in 'data'
        const rawData = response.data;
        const templateData = rawData?.data || rawData;
        setTemplate(templateData);
      } catch (err) {
        console.error("Failed to fetch template:", err);
        setError("Failed to load template data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleBack = () => {
    router.push("/form-builder");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          gap: 2,
        }}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Loading template configuration...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <button onClick={handleBack}>Go Back</button>
      </Box>
    );
  }

  return template ? (
    <FormBuilder initialData={template} onBack={handleBack} />
  ) : (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography>Template not found.</Typography>
      <button onClick={handleBack}>Go Back</button>
    </Box>
  );
};

export default EditTemplatePage;
