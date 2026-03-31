"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Save as SaveIcon,
  Terminal as TerminalIcon,
  DesignServices as DesignIcon,
} from "@mui/icons-material";
import { montserrat } from "@/utils/fonts";

// Components
import Breadcrumb from "@/components/widgets/Breadcrumb";
import Toolbox from "./components/Toolbox";
import FormIdentity from "./components/FormIdentity";
import FieldCard from "./components/FieldCard";
import LivePreview from "./components/LivePreview";

// Hooks
import { useFormTemplate } from "./hooks/useFormTemplate";
import { ArrowBack } from "@mui/icons-material";

interface FormBuilderProps {
  initialData?: any;
  onBack?: () => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ initialData, onBack }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  const {
    formName,
    setFormName,
    formTitle,
    setFormTitle,
    formSection,
    setFormSection,
    fields,
    loading,
    isIdentityOpen,
    setIsIdentityOpen,
    newOptionTexts,
    setNewOptionTexts,
    scrollEndRef,
    addField,
    removeField,
    updateField,
    updateFieldConfig,
    addOption,
    removeOption,
    handleSave,
  } = useFormTemplate(initialData);

  return (
    <Box
      sx={{
        backgroundColor: "#F8FAFC",
        backgroundImage: `radial-gradient(at 0% 0%, ${alpha(theme.palette.primary.main, 0.05)} 0px, transparent 50%), radial-gradient(at 100% 0%, ${alpha(theme.palette.secondary.main, 0.05)} 0px, transparent 50%)`,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 3,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {onBack && (
          <IconButton
            onClick={onBack}
            sx={{
              bgcolor: "white",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
            }}
          >
            <ArrowBack />
          </IconButton>
        )}
        <Breadcrumb
          title={initialData ? "Edit Template" : "Form Builder"}
          data={[
            { title: "Templates", href: "#", onClick: onBack },
            { title: initialData ? "Edit" : "Builder", href: "/form-builder" },
          ]}
        />
      </Box>

      <Box sx={{ flexGrow: 1, px: 3, pb: 2, overflow: "hidden" }}>
        <Grid container spacing={2.5} sx={{ height: "100%" }}>
          {/* Left: Toolbox */}
          <Grid size={{ xs: 12, md: 3, lg: 2.2 }} sx={{ height: "100%" }}>
            <Toolbox onAddField={addField} />
          </Grid>

          {/* Center: Builder Canvas */}
          <Grid
            size={{ xs: 12, md: 9, lg: 6.3 }}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                pr: 1,
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(theme.palette.divider, 0.15),
                  borderRadius: "10px",
                },
              }}
            >
              <Stack spacing={2} sx={{ pb: 8 }}>
                <FormIdentity
                  formName={formName}
                  setFormName={setFormName}
                  formTitle={formTitle}
                  setFormTitle={setFormTitle}
                  formSection={formSection}
                  setFormSection={setFormSection}
                  isOpen={isIdentityOpen}
                  setIsOpen={setIsIdentityOpen}
                />

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                      px: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        fontFamily: montserrat.style.fontFamily,
                      }}
                    >
                      Fields Workspace
                    </Typography>
                    <Chip
                      label={`${fields.length} Modules`}
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        borderRadius: "6px",
                        height: 24,
                        fontSize: "0.65rem",
                      }}
                    />
                  </Box>

                  <Stack spacing={2}>
                    {fields.length === 0 && (
                      <Paper
                        sx={{
                          py: 6,
                          textAlign: "center",
                          borderRadius: "20px",
                          border: "2px dashed",
                          borderColor: alpha(theme.palette.divider, 0.1),
                          bgcolor: "transparent",
                        }}
                      >
                        <DesignIcon
                          sx={{
                            fontSize: 48,
                            color: "text.disabled",
                            mb: 2,
                            opacity: 0.3,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.disabled", fontWeight: 700 }}
                        >
                          Choose an element to get started
                        </Typography>
                      </Paper>
                    )}
                    {fields.map((field) => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        allFields={fields}
                        onRemove={removeField}
                        onUpdate={updateField}
                        onUpdateConfig={updateFieldConfig}
                        onAddOption={addOption}
                        onRemoveOption={removeOption}
                        newOptionText={newOptionTexts[field.id]}
                        setNewOptionText={(id, text) =>
                          setNewOptionTexts({ ...newOptionTexts, [id]: text })
                        }
                      />
                    ))}
                    <div ref={scrollEndRef} />
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Launch Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mt: 0.5,
                borderRadius: "20px",
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: "blur(12px)",
                border: "1px solid",
                borderColor: alpha(theme.palette.divider, 0.05),
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
                boxShadow: "0px -10px 30px rgba(0,0,0,0.02)",
                zIndex: 10,
              }}
            >
              <Button
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SaveIcon sx={{ fontSize: "1rem" }} />
                  )
                }
                onClick={handleSave}
                disabled={loading}
                sx={{
                  px: 5,
                  height: 42,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  background: loading
                    ? alpha(theme.palette.primary.main, 0.4)
                    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: loading
                    ? "none"
                    : `0px 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                  "&:hover": {
                    transform: loading ? "none" : "translateY(-2px)",
                    boxShadow: loading
                      ? "none"
                      : `0px 12px 30px ${alpha(theme.palette.primary.main, 0.35)}`,
                  },
                }}
              >
                {loading ? "Saving Template..." : "Launch Experience Template"}
              </Button>
            </Paper>
          </Grid>

          {/* Right: Preview */}
          <Grid size={{ xs: 12, lg: 3.5 }} sx={{ height: "100%" }}>
            <LivePreview
              fields={fields}
              formTitle={formTitle}
              formName={formName}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FormBuilder;
