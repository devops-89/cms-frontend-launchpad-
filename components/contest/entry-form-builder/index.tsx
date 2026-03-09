"use client";

import React, { useCallback, useState } from "react";
import { Box, Typography, Paper, Stack, Button, Alert } from "@mui/material";
import {
  Visibility as PreviewIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useAppTheme } from "@/context/ThemeContext";
import { FormField, FieldType } from "./types";
import { createDefaultField, swapArrayItems } from "./utils";
import FieldPalettePanel from "./FieldPalettePanel";
import FieldCanvas from "./FieldCanvas";
import FieldConfigPanel from "./FieldConfigPanel";
import FormPreview from "./FormPreview";
import FormBuilderHeader from "./components/FormBuilderHeader";

const EntryFormBuilderRoot: React.FC = () => {
  const { colors } = useAppTheme();

  const [fields, setFields] = useState<FormField[]>([]);
  const [formName, setFormName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;

  const handleAddField = useCallback((type: FieldType) => {
    const field = createDefaultField(type);
    setFields((prev) => [...prev, field]);
    setSelectedId(field.id);
    setSaved(false);
  }, []);

  const handleUpdateField = useCallback((updated: FormField) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setSaved(false);
  }, []);

  const handleRemoveField = useCallback(
    (id: string) => {
      setFields((prev) => prev.filter((f) => f.id !== id));
      if (selectedId === id) setSelectedId(null);
      setSaved(false);
    },
    [selectedId],
  );

  const handleMoveField = useCallback((id: string, dir: -1 | 1) => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      return swapArrayItems(prev, idx, next);
    });
  }, []);

  const handleSave = () => {
    console.log("Form saved:", fields);
    setSaved(true);
  };

  return (
    <Box>
      <FormBuilderHeader
        isPreview={isPreview}
        setIsPreview={setIsPreview}
        formName={formName}
        setFormName={setFormName}
        onSave={handleSave}
        fieldsCount={fields.length}
        saved={saved}
        onCloseAlert={() => setSaved(false)}
      />

      {isPreview ? (
        <FormPreview fields={fields} />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "220px 1fr 300px",
            gap: 3,
            alignItems: "start",
          }}
        >
          <FieldPalettePanel onAddField={handleAddField} />
          <FieldCanvas
            fields={fields}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={handleMoveField}
            onRemove={handleRemoveField}
          />
          <FieldConfigPanel
            selectedField={selectedField}
            onChange={handleUpdateField}
          />
        </Box>
      )}
    </Box>
  );
};

export default EntryFormBuilderRoot;
