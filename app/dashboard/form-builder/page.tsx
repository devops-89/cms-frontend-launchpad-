"use client";

import React from "react";
import DashboardLayout from "@/components/layouts/Dashboard";
import EntryFormBuilder from "@/components/contest/EntryFormBuilder";
import { Box, Typography, Container } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";

const FormBuilderPage = () => {
  const { colors } = useAppTheme();

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <EntryFormBuilder />
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default FormBuilderPage;
