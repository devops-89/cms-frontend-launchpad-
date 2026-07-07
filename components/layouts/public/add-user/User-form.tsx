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
import { useSnackbar } from "@/context/SnackbarContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { matchIsValidTel, MuiTelInput } from "mui-tel-input";
import { parsePhoneNumberFromString, getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { countries, GRADE_OPTIONS } from "@/utils/constant";
import { useFormik } from "formik";
import { AddUser_Validation } from "@/utils/validation";
import moment, { Moment } from "moment";
import { useRegisterParticipant } from "@/hooks/auth/useRegisterParticipant";
import { RegisterParticipantPayload } from "@/types/user";
import { UserRole } from "@/utils/enum";
import { getFormikError } from "@/utils/formikHelper";

const UserForm = () => {
  const { showSnackbar } = useSnackbar();
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
        showSnackbar("User added successfully!", "success");
        formik.resetForm();
      } catch (err) {
        console.error("Failed to add user:", err);
      }
    },
  });

  const handlePhoneNumber = (value: string, info?: any) => {
    const cleanedValue = value.replace(/(?!^\+)\+/g, '');
    const countryCode = info?.countryCode || "IN";
    const example = getExampleNumber(countryCode as any, examples);
    const maxLength = example ? example.formatInternational().length : 15;
    if (cleanedValue.length > maxLength) return;

    formik.setFieldValue("phoneNumber", cleanedValue);
    formik.setFieldTouched("phoneNumber", true, false);
  };

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
              onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("firstName", true, false); }}
              onBlur={formik.handleBlur}
              error={Boolean(getFormikError(formik, "firstName"))}
              helperText={getFormikError(formik, "firstName") as string}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Last Name*"
              fullWidth
              id="lastName"
              name="lastName"
              value={formik.values.lastName}
              onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("lastName", true, false); }}
              onBlur={formik.handleBlur}
              error={Boolean(getFormikError(formik, "lastName"))}
              helperText={getFormikError(formik, "lastName") as string}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Email*"
              fullWidth
              id="email"
              name="email"
              value={formik.values.email}
              onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("email", true, false); }}
              onBlur={formik.handleBlur}
              error={Boolean(getFormikError(formik, "email"))}
              helperText={getFormikError(formik, "email") as string}
            />
          </Grid>
          <Grid size={6}>
            {(() => {
  const phoneVal = formik.values.phoneNumber || "";
  const parsed = parsePhoneNumberFromString(phoneVal);
  const countryCode = parsed?.country || "IN" || "IN";
  const example = getExampleNumber(countryCode as any, examples);
  const maxLength = example ? example.formatInternational().length : 15;

  return (
    <MuiTelInput
      onKeyDown={(e) => {
        if (e.key === "+") {
          e.preventDefault();
          return;
        }
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter"];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
          return;
        }

        const input = e.target as HTMLInputElement;
        if (input && input.selectionStart !== input.selectionEnd) {
          return;
        }

        const phoneVal = (formik.values.phoneNumber as string) || "";
        const parsed = parsePhoneNumberFromString(phoneVal);
        
        if (parsed?.isValid()) {
          e.preventDefault();
          return;
        }

        const currentCountry = parsed?.country || "IN";
        const ex = getExampleNumber(currentCountry as any, examples);
        if (ex) {
          const maxDigits = ex.number.replace(/\D/g, "").length;
          const currentDigits = phoneVal.replace(/\D/g, "").length;
          if (currentDigits >= maxDigits) {
            e.preventDefault();
          }
        } else if (phoneVal.replace(/\D/g, "").length >= 15) {
          e.preventDefault();
        }
      }}
              defaultCountry="IN"
              fullWidth
              label="Phone Number*"
              id="phoneNumber"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={(value, info) => {
                const cleanedValue = value.replace(/(?!^\+)\+/g, '');
                
                const validationCountry = info.countryCode || "IN";
                const ex = getExampleNumber(validationCountry as any, examples);
                
                const phoneVal = (formik.values.phoneNumber as string) || "";
                const oldParsed = parsePhoneNumberFromString(phoneVal);
                
                if (oldParsed?.isValid() && cleanedValue.length > phoneVal.length) {
                  return; 
                }

                if (ex) {
                  const maxDigits = ex.number.replace(/\D/g, "").length;
                  const currentDigits = cleanedValue.replace(/\D/g, "").length;
                  if (currentDigits > maxDigits) return;
                } else if (cleanedValue.replace(/\D/g, "").length > 15) {
                  return;
                }
                
                formik.setFieldValue("phoneNumber", cleanedValue);
                formik.setFieldTouched("phoneNumber", true, false);
              }}
              onBlur={formik.handleBlur}
              error={Boolean(getFormikError(formik, "phoneNumber"))}
              helperText={getFormikError(formik, "phoneNumber") as string}
            />
  );
})()}
          </Grid>
          <Grid size={6}>
            <DatePicker
              label="Date of Birth*"
              slotProps={{
                textField: {
                  fullWidth: true,
                  onBlur: formik.handleBlur,
                  name: "dateOfBirth",
                  error: Boolean(getFormikError(formik, "dateOfBirth")),
                  helperText: getFormikError(formik, "dateOfBirth") as string,
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
                  error={Boolean(getFormikError(formik, "grade"))}
                  helperText={getFormikError(formik, "grade") as string}
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
              onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("password", true, false); }}
              onBlur={formik.handleBlur}
              error={Boolean(getFormikError(formik, "password"))}
              helperText={getFormikError(formik, "password") as string}
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
              onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("confirmPassword", true, false); }}
              onBlur={formik.handleBlur}
              error={Boolean(getFormikError(formik, "confirmPassword"))}
              helperText={getFormikError(formik, "confirmPassword") as string}
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
              onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("schoolName", true, false); }}
              onBlur={formik.handleBlur}
              error={Boolean(getFormikError(formik, "schoolName"))}
              helperText={getFormikError(formik, "schoolName") as string}
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
                  error={Boolean(getFormikError(formik, "country"))}
                  helperText={getFormikError(formik, "country") as string}
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
