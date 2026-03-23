"use client";
import React from "react";
import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import { roboto } from "@/utils/fonts";
import { STATS } from "@/utils/constant";

const OverviewTab = ({ contest }: { contest: any }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {STATS.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ bgcolor: stat.color, borderRadius: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ color: "text.primary" }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: roboto.style.fontFamily }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
          Contest Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
            <Typography variant="body1">{contest.start}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
            <Typography variant="body1">{contest.end}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Current Status</Typography>
            <Typography variant="body1">{contest.status}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Entries</Typography>
            <Typography variant="body1">{contest.entries}</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OverviewTab;
