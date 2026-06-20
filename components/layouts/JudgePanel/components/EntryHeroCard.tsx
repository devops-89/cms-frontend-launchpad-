import React from 'react';
import { Box, Card, Grid, Avatar, Typography, Chip } from '@mui/material';
import { EmojiEvents, HowToVote } from '@mui/icons-material';

export const EntryHeroCard = ({ entry, entryTitle, colors }: { entry: any, entryTitle: string, colors: any }) => {
  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        border: `1px solid ${colors.BORDER}`,
        background: `linear-gradient(135deg, ${colors.SURFACE} 0%, rgba(99, 102, 241, 0.02) 100%)`,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
        mb: 5,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)`, pointerEvents: "none" }}
      />
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, sm: 4, md: 3, lg: 2 }} sx={{ display: "flex", justifyContent: "center" }}>
          <Avatar
            variant="rounded"
            sx={{ width: 120, height: 120, borderRadius: 3, background: `linear-gradient(135deg, ${colors.PRIMARY} 0%, ${colors.SECONDARY} 100%)`, boxShadow: "0 8px 24px rgba(99, 102, 241, 0.2)" }}
          >
            <EmojiEvents sx={{ fontSize: 60, color: "#fff" }} />
          </Avatar>
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 9, lg: 10 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
              {entryTitle}
            </Typography>
            <Chip
              icon={<EmojiEvents sx={{ fontSize: "16px !important", color: "#fff !important" }} />}
              label={`Score: ${entry.score !== null ? entry.score : "Pending"}`}
              sx={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#fff", fontWeight: 700, boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)", border: "none", "& .MuiChip-label": { px: 1.5 } }}
            />
            <Chip
              icon={<HowToVote sx={{ fontSize: "16px !important", color: "#fff !important" }} />}
              label={`Public Votes: ${entry.voteCount !== undefined ? entry.voteCount : 0}`}
              sx={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", fontWeight: 700, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)", border: "none", "& .MuiChip-label": { px: 1.5 } }}
            />
          </Box>
          <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY, mb: 3, fontWeight: 500 }}>
            Contest: <Box component="span" sx={{ color: colors.TEXT_PRIMARY, fontWeight: 700 }}>{entry?.contest?.name || "Unknown Contest"}</Box>
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5, mb: 0.5 }}>Assignment ID</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>{entry.id}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5, mb: 0.5 }}>Submitted At</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>
                {new Date(entry?.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
};
