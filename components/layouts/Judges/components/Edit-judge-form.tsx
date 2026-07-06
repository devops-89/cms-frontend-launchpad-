"use client";
import { ArrowBack } from "@mui/icons-material";
import { UserController } from "@/api/userControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import { EXPERTISE_OPTIONS } from "@/utils/constant";
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    createFilterOptions,
    Grid,
    TextField,
} from "@mui/material";
import { useFormik } from "formik";
import { matchIsValidTel, MuiTelInput } from "mui-tel-input";
import { parsePhoneNumberFromString, getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import React from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { getFormikError } from "@/utils/formikHelper";

import { useQueryClient } from "@tanstack/react-query";

const filter = createFilterOptions<string>();

interface EditJudgeFormProps {
  judgeId: string;
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    expertise: string[];
    judgeProfileId?: string;
  };
}

const EditJudgeForm: React.FC<EditJudgeFormProps> = ({ judgeId, initialData }) => {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: {
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      email: initialData.email || "",
      phoneNumber: initialData.phone || "",
      expertise: initialData.expertise || [],
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      firstName: Yup.string()
        .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed")
        .required("First Name is required"),
      lastName: Yup.string()
        .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed")
        .required("Last Name is required"),
      email: Yup.string()
        .trim()
        .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i, "Invalid email address")
        .required("Email is required"),
      phoneNumber: Yup.string()
        .required("Phone Number is required")
        .test("is-valid-phone", "Invalid phone number", (value) =>
          value ? matchIsValidTel(value) : false
        ),
      expertise: Yup.array()
        .of(Yup.string())
        .min(1, "At least one expertise is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("email", values.email);
        formData.append("phone", values.phoneNumber);
        formData.append("role", "judge");
        formData.append("expertise", JSON.stringify(values.expertise));

        await UserController.editJudge(judgeId, formData);
        showSnackbar("Judge updated successfully", "success");
        queryClient.removeQueries({ queryKey: ["judge-list"] });
        queryClient.removeQueries({ queryKey: ["judge-details", judgeId] });
        router.refresh(); // Add router.refresh() to clear Next.js client-side route cache just in case
        router.push("/user-management/judges");
      } catch (error: any) {
        showSnackbar(
          error?.response?.data?.message || "Something went wrong while updating the judge",
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
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, md: 6 }}>
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
  const countryCode = parsed?.country || "AE" || "IN";
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
      defaultCountry="AE"
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
        <Grid size={12}>
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
            variant="contained"
            sx={{ width: 200, p: 1.5, borderRadius: 2 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Update Judge"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditJudgeForm;
