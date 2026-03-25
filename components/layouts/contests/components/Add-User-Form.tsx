"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { montserrat, roboto } from "@/utils/fonts";
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import React from "react";

const AddUserForm = () => {
  const params = useParams();
  const id = params?.id;

  return (
    <Box>
      <Breadcrumb
        title="Add User to Contest"
        data={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Contest Management", href: "/contest-management/contests" },
          { title: "Contest Details", href: `/contest-management/contests/${id}` },
          { title: "Add User", href: "#" },
        ]}
      />
      
      <Card
        sx={{
          mt: 4,
          maxWidth: 600,
          mx: "auto",
          p: 4,
          boxShadow: "0px 0px 2px 2px #eeeeee",
          borderRadius: 2,
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4, 
            fontFamily: montserrat.style.fontFamily, 
            fontWeight: 600,
            textAlign: "center"
          }}
        >
          Add New User
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              placeholder="Enter user's full name"
              sx={{ fontFamily: roboto.style.fontFamily }}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              placeholder="Enter user's email"
              sx={{ fontFamily: roboto.style.fontFamily }}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              placeholder="Enter user's phone number"
              sx={{ fontFamily: roboto.style.fontFamily }}
            />
          </Grid>
          <Grid size={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ 
                py: 1.5, 
                fontFamily: roboto.style.fontFamily, 
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            >
              Add User
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default AddUserForm;
