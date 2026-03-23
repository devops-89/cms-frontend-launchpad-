"use client";
import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import { roboto } from "@/utils/fonts";

const VotesTab = () => {
  const voteStats = [
    { name: "Project A", votes: 450, total: 1000 },
    { name: "Project B", votes: 210, total: 1000 },
    { name: "Project C", votes: 89, total: 1000 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
        Voting Summary
      </Typography>
      
      <Stack spacing={4}>
        {voteStats.map((item) => (
          <Box key={item.name}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">{item.votes} votes</Typography>
            </Box>
            <LinearProgress variant="determinate" value={(item.votes / item.total) * 100} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default VotesTab;
