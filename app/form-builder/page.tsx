"use client";

import React, { useState } from "react";
import FormBuilder from "@/components/layouts/form-builder/FormBuilder";
import TemplateList from "@/components/layouts/form-builder/components/TemplateList";
import { Box } from "@mui/material";

const FormBuilderPage = () => {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const handleEdit = (template: any) => {
    console.log("template", template);
    setEditingTemplate(template);
    setView("edit");
  };

  const handleBackToList = () => {
    setView("list");
  };

  return (
    <Box>
      {view === "list" ? (
        <TemplateList onEdit={handleEdit} />
      ) : (
        <FormBuilder initialData={editingTemplate} onBack={handleBackToList} />
      )}
    </Box>
  );
};

export default FormBuilderPage;
