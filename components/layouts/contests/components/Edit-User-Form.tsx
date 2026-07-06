"use client";
import { handleStrictInputChange } from "@/utils/inputValidations";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useContestDetails } from "@/store/useContestDetails";
import { countries } from "@/utils/constant";
import { montserrat, roboto } from "@/utils/fonts";
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Slider,
  Rating,
  Alert,
  CircularProgress,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { useSnackbar } from "@/context/SnackbarContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { FIELDS_TYPE } from "@/utils/enum";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Close as CloseIcon } from "@mui/icons-material";
import { FilePreview } from "@/components/widgets/FilePreview";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormHelperText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { contestControllers } from "@/api/contestControllers";
import { getFormikError } from "@/utils/formikHelper";

const EditUserForm = () => {
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string;
  const participantId = searchParams.get("participantId") as string;

  const router = useRouter();

  const { data, isPending, error } = useQuery({
    queryKey: ["Contest Details", id],
    queryFn: () => contestControllers.getContestDetails(id),
    enabled: !!id,
  });

  const template_fields = data?.data?.userLevelTemplate?.schema?.fields || data?.data?.user_level_template?.schema?.fields;

  const { data: participantResponse, isPending: isParticipantPending } = useQuery({
    queryKey: ["Participant Details", id, participantId],
    queryFn: () => contestControllers.getParticipantById(id, participantId),
    enabled: !!id && !!participantId,
  });
  const participantData = participantResponse?.data;
  const formData = participantData?.submission?.data?.data || participantData?.submission?.data || participantData?.participant_profile_data || participantData?.data || {};

  const initialValues = React.useMemo(() => {
    return (
      template_fields?.reduce((acc: any, field: any) => {
        let storedValue = formData[field.id] || formData[field.label] || formData[field.label?.trim() || ""];
        
        if (field.type === FIELDS_TYPE.FILE_UPLOAD && (formData[`${field.id}_downloadUrl`] || formData[`${field.label}_downloadUrl`])) {
          storedValue = formData[`${field.id}_downloadUrl`] || formData[`${field.label}_downloadUrl`];
        }

        if (storedValue === undefined || storedValue === null || storedValue === "") {
           const labelLower = field.label?.toLowerCase() || "";
           if (labelLower.includes("email")) {
             storedValue = formData.ppdwdyx34 || formData.waqb6gjzw;
           } else if (labelLower.includes("phone") || labelLower.includes("mobile")) {
             storedValue = formData.h7695htwx;
           } else if (labelLower.includes("school") || labelLower.includes("college") || labelLower.includes("institution")) {
             storedValue = formData['3swf0lufu'];
           } else if (labelLower.includes("grade") || labelLower.includes("year")) {
             storedValue = formData.wq5kjwwmo;
           } else if (labelLower.includes("country")) {
             storedValue = formData.gjbq1pwch;
           } else if (labelLower.includes("name")) {
             storedValue = formData.qlon5xekd || formData.an7ffo0mu || formData.yg9snrxlh;
           }
        }

        if (storedValue !== undefined && storedValue !== null) {
          acc[field.id] = storedValue;
          return acc;
        }

        acc[field.id] = "";
        if (field.type === FIELDS_TYPE.CHECKBOX || field.type === FIELDS_TYPE.SWITCH) {
          acc[field.id] = false;
        }
        if (field.type === FIELDS_TYPE.SLIDER || field.type === FIELDS_TYPE.RATING) {
          acc[field.id] = 0;
        }
        return acc;
      }, {}) || {}
    );
  }, [template_fields, participantData]);

  const validationSchema = React.useMemo(() => {
    const schemaFields = template_fields?.reduce((acc: any, field: any) => {
        let validator;
        if (
          field.type === FIELDS_TYPE.NUMBER_FIELD ||
          field.type === FIELDS_TYPE.SLIDER ||
          field.type === FIELDS_TYPE.RATING
        ) {
          validator = Yup.number();
        } else if (
          field.type === FIELDS_TYPE.CHECKBOX ||
          field.type === FIELDS_TYPE.SWITCH
        ) {
          validator = Yup.boolean();
        } else if (field.type === FIELDS_TYPE.FILE_UPLOAD) {
          let fileValidator = Yup.mixed();
          if (field.config?.maxSize) {
            const maxSize = Number(field.config.maxSize) * 1024 * 1024;
            fileValidator = fileValidator.test(
              "fileSize",
              `File size is too large (Max: ${field.config.maxSize}MB)`,
              (value: any) => {
                if (!value) return true;
                if (value instanceof File) return value.size <= maxSize;
                return true;
              }
            );
          }
          if (field.config?.allowedExtensions) {
            const allowed = typeof field.config.allowedExtensions === 'string' 
              ? field.config.allowedExtensions.split(",").map((e: string) => e.trim().toLowerCase()) 
              : field.config.allowedExtensions;
            fileValidator = fileValidator.test(
              "fileType",
              `Unsupported file type (Allowed: ${allowed.join(", ")})`,
              (value: any) => {
                if (!value) return true;
                if (value instanceof File) {
                  const extMatch = value.name.match(/\.[0-9a-z]+$/i);
                  const extension = extMatch ? extMatch[0].toLowerCase() : "";
                  return allowed.includes(extension);
                }
                return true;
              }
            );
          }
          validator = fileValidator;
        } else if (field.type === FIELDS_TYPE.TEL_INPUT) {
          validator = Yup.string().test("is-valid-phone", "Invalid phone number", (value) => value ? matchIsValidTel(value) : false);
        } else if (field.type === FIELDS_TYPE.TEXTFIELD && field.id === "email") {
          validator = Yup.string().trim().matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i, "Invalid email address");
        } else {
          validator = Yup.string();
        }

        if (field.required) {
          validator = validator.required(`${field.label} is required`);
        }
        acc[field.id] = validator;
        return acc;
      }, {});
      return Yup.object(schemaFields);
  }, [template_fields]);

  const getVisibleFields = (values: any) => {
    const visible: any[] = [];
    const pages: any[][] = [];
    let currentChunk: any[] = [];
    template_fields?.forEach((field: any) => {
      if (field.type === FIELDS_TYPE.STEP_BREAK && !field.config?.isInline) {
        if (currentChunk.length > 0) pages.push(currentChunk);
        currentChunk = [field];
      } else {
        currentChunk.push(field);
      }
    });
    if (currentChunk.length > 0) pages.push(currentChunk);

    let currentPageIndex = 0;
    const visited = new Set<number>();

    while (currentPageIndex < pages.length && !visited.has(currentPageIndex)) {
      visited.add(currentPageIndex);
      const pageFields = pages[currentPageIndex];
      visible.push(...pageFields);

      let targetStepId: string | null = null;
      let hasBranchingButUnanswered = false;

      for (const field of pageFields) {
        if (["select", "radio", "autocomplete"].includes(field.type as any) && field.config?.enableBranching) {
          const val = values[field.id];
          if (!val) {
            hasBranchingButUnanswered = true;
          } else if (field.config.routing?.[val]) {
            targetStepId = field.config.routing[val];
          }
        }
      }

      if (hasBranchingButUnanswered) break; 
      if (targetStepId) {
        const targetIndex = pages.findIndex((p) => p.length > 0 && p[0].type === FIELDS_TYPE.STEP_BREAK && p[0].id === targetStepId);
        if (targetIndex !== -1) {
          currentPageIndex = targetIndex;
          continue;
        }
      }
      currentPageIndex++;
    }
    return visible;
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validate: (values) => {
      const visible = getVisibleFields(values);
      const visibleFieldIds = new Set(visible.map(f => f.id));
      
      try {
        validationSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (err: any) {
        const errors: any = {};
        err.inner.forEach((error: any) => {
          if (visibleFieldIds.has(error.path)) {
            errors[error.path] = error.message;
          }
        });
        return errors;
      }
    },
    onSubmit: async (values) => {
      try {
        const formDataPayload = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
          if (value instanceof File) {
            formDataPayload.append(key, value);
          } else if (value !== undefined && value !== null) {
            formDataPayload.append(key, String(value));
          }
        });

        const plainValues: any = { ...values };
        Object.keys(plainValues).forEach((key) => {
          if (plainValues[key] instanceof File) {
            plainValues[key] = undefined;
          }
        });
        formDataPayload.append("participant_profile_data", JSON.stringify(plainValues));
        formDataPayload.append("data", JSON.stringify(plainValues));

        await contestControllers.updateParticipantDetails(formDataPayload, id, participantId);
        showSnackbar("Participant updated successfully!", "success");
        router.push(`/contest-management/contests/${id}?tab=1`);
      } catch (err: any) {
        showSnackbar(
          err?.response?.data?.message || "Failed to update participant",
          "error"
        );
      }
    },
  });

  if (isPending || isParticipantPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data && !isPending) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Contest not found. Please go back and try again.</Alert>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => router.back()}>
          Back to Contests
        </Button>
      </Box>
    );
  }

  if (!participantData && !isPending && participantId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Participant details not found. Please go back and try again.</Alert>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => router.back()}>
          Back to Contest
        </Button>
      </Box>
    );
  }

  const visibleFields = getVisibleFields(formik.values);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumb
        title="Edit Participant"
        data={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Contests", href: "/contest-management/contests" },
          { title: "Participants", href: `/contest-management/contests/${id}` },
          { title: "Edit Participant", href: "#" },
        ]}
      />
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: "#6366f1",
            color: "#6366f1",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#4f46e5",
              bgcolor: "rgba(99, 102, 241, 0.04)",
            },
          }}
        >
          Back
        </Button>
      </Box>

      <Card
        sx={{
          mt: 4,
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
            textAlign: "left",
          }}
        >
          Edit Participant
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={4}>
            {visibleFields?.map((val: any) => {
              const isFullWidth = val.type === FIELDS_TYPE.TEXTBLOCK || val.type === FIELDS_TYPE.TEXTAREA || val.type === FIELDS_TYPE.SWITCH || val.type === FIELDS_TYPE.CHECKBOX || val.type === FIELDS_TYPE.RADIO;
              if (val.type === FIELDS_TYPE.STEP_BREAK) {
                return (
                  <Grid key={val.id} size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {val.label}
                    </Typography>
                  </Grid>
                );
              }
              return (
              <Grid key={val.id} size={{ xs: 12, md: isFullWidth ? 12 : 6 }}>
                {val.type === FIELDS_TYPE.TEXTBLOCK && (
                  <Box sx={{ width: "100%", pb: 1 }}>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {val.label}
                    </Typography>
                  </Box>
                )}
                {(val.type === FIELDS_TYPE.TEXTFIELD ||
                  val.type === FIELDS_TYPE.TEXTAREA ||
                  val.type === FIELDS_TYPE.NUMBER_FIELD ||
                  val.type === FIELDS_TYPE.PASSWORD) && (
                  <Box>
                  <TextField
                    label={val.label}
                    type={
                      val.type === FIELDS_TYPE.NUMBER_FIELD
                        ? "number"
                        : val.type === FIELDS_TYPE.PASSWORD
                        ? "password"
                        : "text"
                    }
                    multiline={val.type === FIELDS_TYPE.TEXTAREA}
                    minRows={val.type === FIELDS_TYPE.TEXTAREA ? 4 : undefined}
                    maxRows={val.type === FIELDS_TYPE.TEXTAREA ? 10 : undefined}
                    variant={val.variant}
                    placeholder={val.placeholder}
                    fullWidth
                    required={val.required}
                    name={val.id}
                    value={formik.values[val.id] || ""}
                    onChange={(e) => {
                      let fieldType: "name" | "email" | "number" | "alphanumeric" | "address" | "default" = "default";
                      const label = val.label?.toLowerCase() || "";
                      const id = val.id.toLowerCase();
                      
                      if (id.includes("email") || label.includes("email")) {
                        fieldType = "email";
                      } else if (val.type === FIELDS_TYPE.NUMBER_FIELD || id.includes("pincode") || id.includes("zipcode")) {
                        fieldType = "number";
                      } else if (label.includes("address")) {
                        fieldType = "address";
                      } else if (label.includes("school")) {
                        fieldType = "alphanumeric";
                      } else if (id.includes("firstname") || id.includes("lastname") || label.includes("name") || label.includes("city")) {
                        fieldType = "name";
                      }
                      handleStrictInputChange(e, formik.handleChange, formik.setFieldTouched, fieldType);
                    }}
                    onBlur={formik.handleBlur}
                    error={Boolean(getFormikError(formik, val.id))}
                    helperText={
                      (getFormikError(formik, val.id) as string) ||
                      val.helperText
                    }
                  />
                  {val.type === FIELDS_TYPE.TEXTAREA && val.config?.maxWords && (
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                      Max words: {val.config.maxWords}
                    </Typography>
                  )}
                  </Box>
                )}

                {val.type === FIELDS_TYPE.TEL_INPUT && (
                  <Box>
                    <MuiTelInput
                      label={val.label}
                      variant={val.variant}
                      fullWidth
                      required={val.required}
                      name={val.id}
                      value={formik.values[val.id] || ""}
                      onChange={(value) => {
                        const prevValue = formik.values[val.id] || "";
                        const isCurrentlyValid = matchIsValidTel(prevValue);
                        const isNewValid = matchIsValidTel(value);
                        const prevDigits = prevValue.replace(/\D/g, "");
                        const newDigits = value.replace(/\D/g, "");

                        if (isCurrentlyValid && !isNewValid && newDigits.length > prevDigits.length) {
                          if (newDigits.startsWith(prevDigits)) {
                            return;
                          }
                        }

                        formik.setFieldValue(val.id, value);
                        formik.setFieldTouched(val.id, true, false);
                      }}
                      onBlur={() => formik.setFieldTouched(val.id, true)}
                      error={Boolean(getFormikError(formik, val.id))}
                      defaultCountry={(val.config?.defaultCountry || 'IN') as any}
                          onlyCountries={val.config?.onlyCountries || undefined}
                    />
                    {getFormikError(formik, val.id) && (
                      <FormHelperText error>
                        {getFormikError(formik, val.id) as string}
                      </FormHelperText>
                    )}
                  </Box>
                )}

                {val.type === FIELDS_TYPE.DATE_PICKER && (
                  <Box>
                    <DatePicker
                      label={val.label}
                      sx={{ width: "100%" }}
                      value={
                        formik.values[val.id]
                          ? dayjs(formik.values[val.id])
                          : null
                      }
                      onChange={(newValue) =>
                        formik.setFieldValue(val.id, newValue && newValue.isValid() ? newValue.toISOString() : null)
                      }
                      slotProps={{
                        textField: {
                          error: Boolean(getFormikError(formik, val.id)),
                          helperText:
                            (getFormikError(formik, val.id) as string) ||
                            val.helperText,
                          required: val.required,
                        },
                      }}
                      disablePast={val.config?.disablePast}
                      disableFuture={val.config?.disableFuture}
                    />
                  </Box>
                )}

                {val.type === FIELDS_TYPE.SELECT && (
                  <FormControl
                    fullWidth
                    variant={val.variant}
                    error={Boolean(getFormikError(formik, val.id))}
                  >
                    <InputLabel>{val.label}</InputLabel>
                    <Select
                      label={val.label}
                      name={val.id}
                      value={formik.values[val.id] || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {(val.options as string[])?.map((opt: string) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                    {getFormikError(formik, val.id) ||
                    val.helperText ? (
                      <FormHelperText>
                        {(getFormikError(formik, val.id) as string) ||
                          val.helperText}
                      </FormHelperText>
                    ) : null}
                  </FormControl>
                )}

                {val.type === FIELDS_TYPE.AUTOCOMPLETE && (
                  <Autocomplete
                    options={(val.options as string[]) || []}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={val.label}
                        variant={val.variant}
                        placeholder={val.placeholder}
                        error={Boolean(getFormikError(formik, val.id))}
                        helperText={
                          (getFormikError(formik, val.id) as string) ||
                          val.helperText
                        }
                        required={val.required}
                      />
                    )}
                    value={formik.values[val.id] || null}
                    onChange={(_, newValue) =>
                      formik.setFieldValue(val.id, newValue)
                    }
                    onBlur={() => formik.setFieldTouched(val.id, true)}
                  />
                )}

                {val.type === FIELDS_TYPE.COUNTRY_SELECTOR &&
                  (val.options?.length ? (
                    <Autocomplete
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={val.label || "Country Of Residence"}
                          error={Boolean(getFormikError(formik, val.id))}
                          helperText={
                            (getFormikError(formik, val.id) as string) ||
                            val.helperText
                          }
                          required={val.required}
                        />
                      )}
                      options={val.options}
                      value={formik.values[val.id] || null}
                      onChange={(_, newValue) =>
                        formik.setFieldValue(val.id, newValue)
                      }
                      onBlur={() => formik.setFieldTouched(val.id, true)}
                    />
                  ) : (
                    <Autocomplete
                      id={val.id}
                      options={countries}
                      autoHighlight
                      getOptionLabel={(option) => option.label}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props as any;
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
                          label={val.label || "Choose a country"}
                          slotProps={{
                            htmlInput: {
                              ...params.inputProps,
                              autoComplete: "new-password",
                            },
                          }}
                          fullWidth
                          error={Boolean(getFormikError(formik, val.id))}
                          helperText={
                            (getFormikError(formik, val.id) as string) ||
                            val.helperText
                          }
                          required={val.required}
                        />
                      )}
                      value={
                        countries.find(
                          (c) => c.label === formik.values[val.id]
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        formik.setFieldValue(val.id, newValue?.label || "")
                      }
                      onBlur={() => formik.setFieldTouched(val.id, true)}
                    />
                  ))}

                {(val.type === FIELDS_TYPE.CHECKBOX ||
                  val.type === FIELDS_TYPE.SWITCH) && (
                  <Box>
                    <FormControlLabel
                      sx={val.type === FIELDS_TYPE.SWITCH ? { width: "100%", m: 0, justifyContent: "space-between" } : undefined}
                      labelPlacement={val.type === FIELDS_TYPE.SWITCH ? "start" : "end"}
                      control={
                        val.type === FIELDS_TYPE.CHECKBOX ? (
                          <Checkbox
                            name={val.id}
                            checked={Boolean(formik.values[val.id])}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        ) : (
                          <Switch
                            name={val.id}
                            checked={Boolean(formik.values[val.id])}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        )
                      }
                      label={val.label}
                    />
                    {getFormikError(formik, val.id) && (
                      <FormHelperText error>
                        {getFormikError(formik, val.id) as string}
                      </FormHelperText>
                    )}
                  </Box>
                )}

                {val.type === FIELDS_TYPE.RADIO && (
                  <FormControl
                    component="fieldset"
                    error={Boolean(getFormikError(formik, val.id))}
                  >
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      {val.label}
                    </Typography>
                    <RadioGroup
                      name={val.id}
                      value={formik.values[val.id] || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {(val.options as string[])?.map((opt: string) => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={<Radio />}
                          label={opt}
                        />
                      ))}
                    </RadioGroup>
                    {getFormikError(formik, val.id) && (
                      <FormHelperText>
                        {getFormikError(formik, val.id) as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}

                {(val.type === FIELDS_TYPE.SLIDER ||
                  val.type === FIELDS_TYPE.RATING) && (
                  <Box sx={{ px: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      {val.label}
                    </Typography>
                    {val.type === FIELDS_TYPE.SLIDER ? (
                      <Slider
                        name={val.id}
                        value={Number(formik.values[val.id]) || 0}
                        onChange={(_, value) =>
                          formik.setFieldValue(val.id, value)
                        }
                        onBlur={() => formik.setFieldTouched(val.id, true)}
                        valueLabelDisplay="auto"
                      />
                    ) : (
                      <Rating
                        name={val.id}
                        value={Number(formik.values[val.id]) || 0}
                        onChange={(_, value) =>
                          formik.setFieldValue(val.id, value)
                        }
                        onBlur={() => formik.setFieldTouched(val.id, true)}
                      />
                    )}
                    {getFormikError(formik, val.id) && (
                      <FormHelperText error>
                        {getFormikError(formik, val.id) as string}
                      </FormHelperText>
                    )}
                  </Box>
                )}
                
                {val.type === FIELDS_TYPE.FILE_UPLOAD && (
                  <Box sx={{ p: 1.5, border: "1px dashed", borderColor: "divider", borderRadius: "10px", position: "relative", width: "100%", boxSizing: "border-box" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "left" }}>
                          {val.label} {val.required && "*"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "left" }}>
                          {val.config?.allowedExtensions ? `Allowed: ${val.config?.allowedExtensions}` : "All files allowed"} 
                          {val.config?.maxSize ? ` (Max: ${val.config?.maxSize}MB)` : ""}
                        </Typography>
                      </Box>
                      {!formik.values[val.id] ? (
                        <Button variant="outlined" component="label" size="small" sx={{ whiteSpace: 'nowrap' }}>
                          Upload File
                          <input 
                            type="file" 
                            hidden 
                            accept={val.config?.allowedExtensions || undefined}
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                formik.setFieldValue(val.id, e.target.files[0]);
                              }
                            }}
                          />
                        </Button>
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {(() => {
                            const fileVal = formik.values[val.id];
                            return (
                              <FilePreview 
                                fileVal={fileVal} 
                                label={val.label} 
                                onClear={() => formik.setFieldValue(val.id, null)} 
                              />
                            );
                          })()}
                        </Box>
                      )}
                    </Box>
                    {getFormikError(formik, val.id) && (
                      <FormHelperText error sx={{ textAlign: "center", mt: 1 }}>
                        {getFormikError(formik, val.id) as string}
                      </FormHelperText>
                    )}
                  </Box>
                )}
              </Grid>
              );
            })}
          </Grid>
        </LocalizationProvider>

        <Box
          sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() => router.back()}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={
              formik.isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={() => {
              if (!formik.dirty) {
                showSnackbar("Please make some changes before updating", "warning");
                return;
              }
              formik.handleSubmit();
            }}
            sx={{
              borderRadius: 2,
              px: 6,
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              boxShadow: "0px 8px 16px rgba(99, 102, 241, 0.2)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 12px 20px rgba(99, 102, 241, 0.3)",
              },
            }}
          >
            {formik.isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default EditUserForm;
