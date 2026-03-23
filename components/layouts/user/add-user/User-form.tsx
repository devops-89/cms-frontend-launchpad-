"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import LayoutProvider from "@/components/widgets/Layout-Provider";
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { MuiTelInput } from "mui-tel-input";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { countries, GRADE_OPTIONS } from "@/utils/constant";
import { useFormik } from "formik";
import { AddUser_Validation } from "@/utils/validation";
import moment, { Moment } from "moment";
import { useRegisterParticipant } from "@/hooks/auth/useRegisterParticipant";
import { RegisterParticipantPayload } from "@/types/user";
import { UserRole } from "@/utils/enum";

const UserForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    isLoading,
    error: registrationError,
  } = useRegisterParticipant();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: null as Moment | null,
      grade: "",
      password: "",
      confirmPassword: "",
      schoolName: "",
      country: "",
    },
    validationSchema: AddUser_Validation,
    onSubmit: async (values) => {
      try {
        const payload: RegisterParticipantPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phoneNumber,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : null,
          grade: values.grade,
          password: values.password,
          schoolName: values.schoolName,
          country: values.country,
          role: UserRole.PARTICIPANT,
          confirmPassword: values.confirmPassword,
        };
        await register(payload);
        alert("User added successfully!");
        formik.resetForm();
      } catch (err) {
        console.error("Failed to add user:", err);
      }
    },
  });

  return (
    <Box sx={{ px: 3 }}>
      <Breadcrumb
        title="Add User"
        data={[
          {
            title: "Dashboard",
            href: "/dashboard",
          },
          {
            title: "User Management",
            href: "/user-management/users",
          },
          {
            title: "Add User",
            href: "/user-management/users/add-user",
          },
        ]}
      />
      <form onSubmit={formik.handleSubmit}>
        <Grid container sx={{ mt: 4 }} spacing={5}>
          <Grid size={6}>
            <TextField
              label="First Name*"
              fullWidth
              id="firstName"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Last Name*"
              fullWidth
              id="lastName"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Email*"
              fullWidth
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid size={6}>
            <MuiTelInput
              defaultCountry="IN"
              fullWidth
              label="Phone Number*"
              id="phoneNumber"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={(value) => formik.setFieldValue("phoneNumber", value)}
              onBlur={formik.handleBlur}
              error={
                formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
              }
              helperText={
                formik.touched.phoneNumber && formik.errors.phoneNumber
              }
            />
          </Grid>
          <Grid size={6}>
            <DatePicker
              label="Date of Birth*"
              slotProps={{
                textField: {
                  fullWidth: true,
                  onBlur: formik.handleBlur,
                  name: "dateOfBirth",
                  error:
                    formik.touched.dateOfBirth &&
                    Boolean(formik.errors.dateOfBirth),
                  helperText:
                    formik.touched.dateOfBirth &&
                    (formik.errors.dateOfBirth as string),
                },
              }}
              disableFuture
              value={formik.values.dateOfBirth}
              onChange={(value) => formik.setFieldValue("dateOfBirth", value)}
            />
          </Grid>
          <Grid size={6}>
            <Autocomplete
              id="grade"
              options={GRADE_OPTIONS}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              value={
                GRADE_OPTIONS.find(
                  (opt) => opt.label === formik.values.grade,
                ) || null
              }
              onChange={(_, newValue) =>
                formik.setFieldValue("grade", newValue ? newValue.label : "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Grade*"
                  id="grade"
                  name="grade"
                  onBlur={formik.handleBlur}
                  error={formik.touched.grade && Boolean(formik.errors.grade)}
                  helperText={formik.touched.grade && formik.errors.grade}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Password*"
              fullWidth
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "text.secondary" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Confirm Password*"
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "text.secondary" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="School Name*"
              fullWidth
              id="schoolName"
              name="schoolName"
              value={formik.values.schoolName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.schoolName && Boolean(formik.errors.schoolName)
              }
              helperText={formik.touched.schoolName && formik.errors.schoolName}
            />
          </Grid>
          <Grid size={6}>
            <Autocomplete
              id="country"
              options={countries}
              autoHighlight
              getOptionLabel={(option) => option.label}
              value={
                countries.find((c) => c.label === formik.values.country) || null
              }
              onChange={(_, newValue) =>
                formik.setFieldValue("country", newValue ? newValue.label : "")
              }
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={key}
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...optionProps}
                  >
                    <img
                      loading="lazy"
                      width="20"
                      srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                      src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                      alt=""
                    />
                    {option.label}
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Choose a country"
                  slotProps={{
                    htmlInput: {
                      ...params.inputProps,
                      autoComplete: "new-password",
                    },
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.country && Boolean(formik.errors.country)
                  }
                  helperText={formik.touched.country && formik.errors.country}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            {registrationError && (
              <Box sx={{ color: "error.main", mb: 2 }}>{registrationError}</Box>
            )}
            <Button
              variant="outlined"
              sx={{ width: 300, p: 1 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add User"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default UserForm;
