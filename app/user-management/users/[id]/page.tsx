"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";

const UserDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Breadcrumb
          title={`User Details: #${id}`}
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Users", href: "/user-management/users" },
            { title: "Details", href: `/user-management/users/${id}` },
          ]}
        />
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ color: colors.PRIMARY }}
        >
          Back to List
        </Button>
      </Box>

      <Paper
        sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.BORDER}` }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          User Profile
        </Typography>
        <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY }}>
          Detailed information for User ID: <strong>{id}</strong> will be
          displayed here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserDetailsPage;
