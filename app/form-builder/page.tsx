"use client";

import React from "react";
import TemplateList from "@/components/layouts/form-builder/components/TemplateList";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

const FormBuilderPage = () => {
  const router = useRouter();

  const handleEdit = (template: any) => {
    // Navigate to the new edit-template page under form-builder
    router.push(`/form-builder/edit-template/${template.id}`);
  };

  return (
    <Box>
      <TemplateList onEdit={handleEdit} />
    </Box>
  );
};

export default FormBuilderPage;
