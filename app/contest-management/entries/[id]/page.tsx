"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Button, Paper, Avatar, Chip } from "@mui/material";
import { ArrowBack, EmojiEvents } from "@mui/icons-material";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import { ENTRIES } from "@/utils/constant";

const EntryDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { colors } = useAppTheme();

  // Find the entry in mock data
  const entry = ENTRIES.find((e) => e.id === Number(id));

  if (!entry) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Entry not found</Typography>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Breadcrumb
          title={`Entry Details: ${entry.title}`}
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Contests", href: "/contest-management/contests" },
            { title: "Entry Details", href: `/contest-management/entries/${id}` },
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

      <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.BORDER}` }}>
        <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
          <Avatar
            variant="rounded"
            src={entry.thumbnail}
            sx={{ width: 300, height: 180, borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
              {entry.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: colors.TEXT_SECONDARY }}>
              Submitted by: <strong>{entry.author}</strong>
            </Typography>
            
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Chip
                icon={<EmojiEvents />}
                label={`Score: ${entry.score}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Typography variant="caption" sx={{ alignSelf: "center", color: colors.TEXT_SECONDARY }}>
                Uploaded: {entry.uploaded}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY, lineHeight: 1.6 }}>
              Detailed submission information for entry <strong>#{id}</strong> will be displayed here.
              This view can be expanded to include submission files, judge scores, and user comments.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EntryDetailsPage;
