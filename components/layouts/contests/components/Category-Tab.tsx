"use client";
import React from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import { roboto } from "@/utils/fonts";

const CategoryTab = () => {
  const categories = ["Technology", "Innovation", "Youth", "STEM", "Sustainability"];
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
        Contest Categories
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {categories.map((cat) => (
          <Chip key={cat} label={cat} variant="outlined" color="primary" sx={{ fontWeight: 500 }} />
        ))}
      </Stack>
      <Typography variant="body2" sx={{ mt: 3, color: "text.secondary", fontFamily: roboto.style.fontFamily }}>
        Manage and assign categories to the contest to help participants find relevant challenges.
      </Typography>
    </Box>
  );
};

export default CategoryTab;
