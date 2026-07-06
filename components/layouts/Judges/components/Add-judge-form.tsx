"use client";
import { EXPERTISE_OPTIONS } from "@/utils/constant";
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  TextField,
  createFilterOptions,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff , ArrowBack} from "@mui/icons-material";
import { useFormik } from "formik";
import { matchIsValidTel, MuiTelInput } from "mui-tel-input";
import { parsePhoneNumberFromString, getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import React from "react";
import * as Yup from "yup";
import { AuthControllers } from "@/api/authControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { useRouter } from "next/navigation";
import { getFormikError } from "@/utils/formikHelper";

const filter = createFilterOptions<string>();

const AddJudgeForm = () => {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      expertise: [] as string[],
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .trim()
        .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed")
        .min(2, "First Name must be at least 2 characters")
        .max(50, "First Name must not exceed 50 characters")
        .required("First Name is required"),
      lastName: Yup.string()
        .trim()
        .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed")
        .min(2, "Last Name must be at least 2 characters")
        .max(50, "Last Name must not exceed 50 characters")
        .required("Last Name is required"),
      email: Yup.string()
        .trim()
        .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i, "Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters"),
      phoneNumber: Yup.string()
        .required("Phone Number is required")
        .test("is-valid-phone", "Invalid phone number", (value) =>
          value ? matchIsValidTel(value) : false
        ),
      expertise: Yup.array()
        .of(Yup.string())
        .min(1, "At least one expertise is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await AuthControllers.addJudge({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          phone: values.phoneNumber,
          expertise: values.expertise,
        });
        showSnackbar("Judge added successfully", "success");
        resetForm();
        router.push("/user-management/judges");
      } catch (error: any) {
        showSnackbar(
          error?.response?.data?.message || "Something went wrong while adding the judge",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handlePhoneNumber = (value: string, info: any) => {
    const prevValue = formik.values.phoneNumber || "";
    const isCurrentlyValid = matchIsValidTel(prevValue);
    const isNewValid = matchIsValidTel(value);

    const prevDigits = prevValue.replace(/\D/g, "");
    const newDigits = value.replace(/\D/g, "");

    // Prevent entering more digits if the number is already valid and the new input makes it invalid
    if (isCurrentlyValid && !isNewValid && newDigits.length > prevDigits.length) {
      if (newDigits.startsWith(prevDigits)) {
        return; // Block appending extra digits
      }
    }

    formik.setFieldValue("phoneNumber", value);
    formik.setFieldTouched("phoneNumber", true, false);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }} autoComplete="off">
      <input type="email" name="hidden-email" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
      <input type="password" name="hidden-password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
      <Grid container spacing={5}>
        <Grid size={6}>
          <TextField
            name="firstName"
            label="First Name*"
            fullWidth
            value={formik.values.firstName}
            onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("firstName", true, false); }}
            onBlur={formik.handleBlur}
            error={Boolean(getFormikError(formik, "firstName"))}
            helperText={getFormikError(formik, "firstName") as string}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            name="lastName"
            label="Last Name*"
            fullWidth
            value={formik.values.lastName}
            onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("lastName", true, false); }}
            onBlur={formik.handleBlur}
            error={Boolean(getFormikError(formik, "lastName"))}
            helperText={getFormikError(formik, "lastName") as string}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            name="email"
            label="Email*"
            type="email"
            fullWidth
            autoComplete="new-password"
            value={formik.values.email}
            onChange={(e) => { formik.handleChange(e); formik.setFieldTouched("email", true, false); }}
            onBlur={formik.handleBlur}
            error={Boolean(getFormikError(formik, "email"))}
            helperText={getFormikError(formik, "email") as string}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            name="password"
            label="Password*"
            type={showPassword ? "text" : "password"}
            fullWidth
            autoComplete="new-password"
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
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
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
          {(() => {
  const phoneVal = formik.values.phoneNumber || "";
  const parsed = parsePhoneNumberFromString(phoneVal);
  const countryCode = parsed?.country || "US" || "IN";
  const example = getExampleNumber(countryCode as any, examples);
  const maxLength = example ? example.formatInternational().length : 15;

  return (
    <MuiTelInput
      onKeyDown={(e) => {
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab"];
        if (phoneVal.length >= maxLength && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      }}
            defaultCountry="US"
            fullWidth
            label="Phone Number*"
            onChange={handlePhoneNumber}
            onBlur={() => formik.setFieldTouched("phoneNumber", true)}
            value={formik.values.phoneNumber}
            error={Boolean(getFormikError(formik, "phoneNumber"))}
            helperText={getFormikError(formik, "phoneNumber") as string}
          />
  );
})()}
        </Grid>
        <Grid size={6}>
          <Autocomplete
            multiple
            value={formik.values.expertise}
            onChange={(event, newValue) => {
              formik.setFieldValue("expertise", newValue);
            }}
            onBlur={() => formik.setFieldTouched("expertise", true)}
            options={EXPERTISE_OPTIONS}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Expertise*"
                fullWidth
                error={Boolean(getFormikError(formik, "expertise"))}
                helperText={getFormikError(formik, "expertise") as string}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Button
            type="submit"
            variant="outlined"
            sx={{ width: 200, p: 1 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : "Add Judge"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddJudgeForm;
