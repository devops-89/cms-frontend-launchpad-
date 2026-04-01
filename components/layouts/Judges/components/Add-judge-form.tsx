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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import { matchIsValidTel, MuiTelInput } from "mui-tel-input";
import React from "react";
import * as Yup from "yup";
import { AuthControllers } from "@/api/authControllers";
import { useSnackbar } from "@/context/SnackbarContext";

const filter = createFilterOptions<string>();

const AddJudgeForm = () => {
  const { showSnackbar } = useSnackbar();
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
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
      phoneNumber: Yup.string()
        .required("Phone Number is required")
        .test("is-valid-phone", "Invalid phone number", (value) =>
          value ? matchIsValidTel(value) : false
        ),
      expertise: Yup.array().min(1, "At least one expertise is required"),
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

  const handlePhoneNumber = (value: string) => {
    formik.setFieldValue("phoneNumber", value);
    const isValidPhoneNumber = matchIsValidTel(value);
    if (!isValidPhoneNumber) {
      formik.setFieldError("phoneNumber", "Invalid phone number");
    } else {
      formik.setFieldError("phoneNumber", "");
      formik.setFieldValue("phoneNumber", value);
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={5}>
        <Grid size={6}>
          <TextField
            name="firstName"
            label="First Name*"
            fullWidth
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            name="lastName"
            label="Last Name*"
            fullWidth
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            name="email"
            label="Email*"
            type="email"
            fullWidth
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            name="password"
            label="Password*"
            type={showPassword ? "text" : "password"}
            fullWidth
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
          <MuiTelInput
            defaultCountry="US"
            fullWidth
            label="Phone Number*"
            onChange={handlePhoneNumber}
            onBlur={() => formik.setFieldTouched("phoneNumber", true)}
            value={formik.values.phoneNumber}
            error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
          />
        </Grid>
        <Grid size={6}>
          <Autocomplete
            multiple
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            value={formik.values.expertise}
            onChange={(event, newValue) => {
              if (typeof newValue === "string") return;
              const cleanedValues = newValue.map((val) => {
                if (val.startsWith('Add "') && val.endsWith('"')) {
                  return val.slice(5, -1);
                }
                return val;
              });
              formik.setFieldValue("expertise", Array.from(new Set(cleanedValues)));
            }}
            onBlur={() => formik.setFieldTouched("expertise", true)}
            options={EXPERTISE_OPTIONS}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                (option) => inputValue.toLowerCase() === option.toLowerCase(),
              );
              if (inputValue !== "" && !isExisting) {
                filtered.push(`Add "${inputValue}"`);
              }
              return filtered;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Expertise*"
                fullWidth
                error={formik.touched.expertise && Boolean(formik.errors.expertise)}
                helperText={formik.touched.expertise && formik.errors.expertise as string}
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
