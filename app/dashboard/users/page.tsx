"use client";

import React from "react";
import UserTable from "@/components/users";
import DashboardLayout from "@/components/layouts/Dashboard";
import { Container, Box } from "@mui/material";

export default function UsersPage() {
  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <UserTable />
        </Box>
      </Container>
    </DashboardLayout>
  );
}
