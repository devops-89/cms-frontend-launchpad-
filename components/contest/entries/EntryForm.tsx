"use client";

import React from "react";
import { Container, Paper, Stepper, Step, StepLabel } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Moment } from "moment";
import { useAppTheme } from "@/context/ThemeContext";

// Modular Components
import {
  STEPS,
  getTextFieldStyles,
  createDefaultMember,
} from "./formConstants";
import InnovationOverview from "./InnovationOverview";
import InnovationDetailsStep from "./InnovationDetailsStep";
import ReviewStep from "./ReviewStep";

const EntryForm = () => {
  const { colors } = useAppTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const textFieldStyles = getTextFieldStyles(colors);

  const [formData, setFormData] = React.useState({
    innovationTitle: "",
    status: "",
    thumbnail: null as File | null,
    members: [createDefaultMember()],
    // Step 1: Innovation Details
    category: "",
    problemSolving: "",
    description: "",
    vision: "",
    existingSolutions: "",
    youtubeLink: "",
    // Patent Details
    hasPatent: "No",
    patentHelp: "",
    patentAppNo: "",
    patentCountry: "",
    patentDate: null as Moment | null,
    patentGoogleLink: "",
    // Consents
    consentDataUse: false,
    consentParent: false,
    consentTerms: false,
  });

  const handleMemberChange = (idx: number, field: string, value: any) => {
    const updatedMembers = [...formData.members];
    updatedMembers[idx] = { ...updatedMembers[idx], [field]: value };
    setFormData((prev) => ({ ...prev, members: updatedMembers }));
  };

  const handleAddMember = () => {
    if (formData.members.length < 5) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, createDefaultMember()],
      }));
    }
  };

  const handleRemoveMember = (idx: number) => {
    if (formData.members.length > 1) {
      const updatedMembers = formData.members.filter((_, i) => i !== idx);
      setFormData((prev) => ({ ...prev, members: updatedMembers }));
    }
  };

  const renderContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <InnovationOverview
            formData={formData}
            setFormData={setFormData}
            onNext={() => setActiveStep(1)}
            colors={colors}
            textFieldStyles={textFieldStyles}
            handleMemberChange={handleMemberChange}
            handleAddMember={handleAddMember}
            handleRemoveMember={handleRemoveMember}
          />
        );
      case 1:
        return (
          <InnovationDetailsStep
            formData={formData}
            setFormData={setFormData}
            onBack={() => setActiveStep(0)}
            onNext={() => setActiveStep(2)}
            colors={colors}
            textFieldStyles={textFieldStyles}
          />
        );
      case 2:
        return (
          <ReviewStep
            formData={formData}
            onBack={() => setActiveStep(1)}
            colors={colors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": { fontWeight: 600 },
                  "& .Mui-active": { color: `${colors.PRIMARY} !important` },
                  "& .Mui-completed": { color: `${colors.PRIMARY} !important` },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: `1px solid ${colors.BORDER}`,
            bgcolor: colors.SURFACE,
            backdropFilter: "blur(20px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
          }}
        >
          {renderContent()}
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default EntryForm;
