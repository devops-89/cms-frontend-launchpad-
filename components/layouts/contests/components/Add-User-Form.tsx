"use client";
import { roboto } from "@/utils/fonts";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

const AddUserForm = () => {
  return (
    <Box sx={{ mt: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 3, fontFamily: roboto.style.fontFamily, fontWeight: 600 }}>
        Add User to Contest
      </Typography>
      <Grid container spacing={3}>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            placeholder="Enter user's full name"
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            placeholder="Enter user's email"
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Phone Number"
            variant="outlined"
            placeholder="Enter user's phone number"
          />
        </Grid>
        <Grid size={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ py: 1.5, fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
          >
            Add User
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddUserForm;
