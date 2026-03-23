"use client";
import { Box, Button, Grid, TextField } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import React from "react";

const AddJudgeForm = () => {
  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={5}>
        <Grid size={6}>
          <TextField label="First Name*" fullWidth />
        </Grid>
        <Grid size={6}>
          <TextField label="Last Name*" fullWidth />
        </Grid>
        <Grid size={6}>
          <TextField label="Email*" fullWidth />
        </Grid>
        <Grid size={6}>
          <MuiTelInput defaultCountry="US" fullWidth />
        </Grid>
        <Grid size={6}>
          <Button variant="outlined" sx={{ width: 200, p: 1 }}>
            Add Judge
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddJudgeForm;
