"use client";
import { handleStrictInputChange } from "@/utils/inputValidations";

import Image from "next/image";
import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useSnackbar } from "@/context/SnackbarContext";
import { countries } from "@/utils/constant";
import { FIELDS_TYPE } from "@/utils/enum";
import { montserrat } from "@/utils/fonts";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { FilePreview } from "@/components/widgets/FilePreview";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import * as Yup from "yup";
import { getFormikError } from "@/utils/formikHelper";

const extractS3Key = (url: string) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return url;
  
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;
    
    const entriesIdx = path.indexOf('/entries/');
    if (entriesIdx !== -1) {
      return path.slice(entriesIdx + 1);
    }
    const usersIdx = path.indexOf('/users/');
    if (usersIdx !== -1) {
      return path.slice(usersIdx + 1);
    }
    
    let cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const segments = cleanPath.split('/');
    if (segments.length > 1 && (segments[0].includes('bucket') || segments[0].includes('launchpad'))) {
      cleanPath = segments.slice(1).join('/');
    }
    return cleanPath;
  } catch (e) {
    return url;
  }
};

const EditEntryForm = () => {
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string;
  const entryId = searchParams.get("entryId") as string;
  const { data, isPending } = useQuery({
    queryKey: ["Contest Details", id],
    queryFn: () => contestControllers.getContestDetails(id),
    enabled: !!id,
  });
  const { data: entryResponse, isPending: isEntryPending } = useQuery({
    queryKey: ["Entry Details", id, entryId],
    queryFn: () => entryControllers.getEntryById(id, entryId),
    enabled: !!id && !!entryId,
  });
  const entryData = entryResponse?.data;
  
  const template_fields = entryData?.contest?.entryLevelTemplate?.schema?.fields || entryData?.contest?.entry_level_template?.schema?.fields || data?.data?.entryLevelTemplate?.schema?.fields || data?.data?.entry_level_template?.schema?.fields;
  
  const initialValues = React.useMemo(() => {
    const baseValues = template_fields?.reduce((acc: any, field: any) => {
        const submissionData = entryData?.submission?.data?.data || entryData?.submission?.data || {};
        
        let storedValue = submissionData[field.id] || submissionData[field.label] || submissionData[field.label?.trim() || ""];

        if (field.type === FIELDS_TYPE.FILE_UPLOAD && (submissionData[`${field.id}_downloadUrl`] || submissionData[`${field.label}_downloadUrl`])) {
          storedValue = submissionData[`${field.id}_downloadUrl`] || submissionData[`${field.label}_downloadUrl`];
        }

        if (storedValue !== undefined && storedValue !== null) {
          if (field.type === FIELDS_TYPE.CHECKBOX || field.type === FIELDS_TYPE.SWITCH) {
            acc[field.id] = storedValue === true || String(storedValue).toLowerCase() === "true" || storedValue === "Yes";
          } else {
            acc[field.id] = storedValue;
          }
          return acc;
        }
        acc[field.id] = "";
        if (
          field.type === FIELDS_TYPE.CHECKBOX || field.type === FIELDS_TYPE.SWITCH
        ) {
          acc[field.id] = false;
        }
        if (
          field.type === FIELDS_TYPE.SLIDER || field.type === FIELDS_TYPE.RATING
        ) {
          acc[field.id] = 0;
        }
        return acc;
      }, {}) || {};

      const submissionData = entryData?.submission?.data?.data || entryData?.submission?.data || {};
      Object.keys(submissionData).forEach((key) => {
        if (key === "status" || key === "isDraft" || key.endsWith("_downloadUrl")) return;
        const exists = template_fields?.find((f: any) => f.id === key || f.label === key);
        if (!exists) {
          baseValues[key] = submissionData[key];
        }
      });
      return baseValues;
  }, [template_fields, entryData]);

  const addMemberField = template_fields?.find(
    (f: any) =>
      f.type === FIELDS_TYPE.SELECT &&
      f.label?.toLowerCase().includes("add another member"),
  );
  const validationSchema = React.useMemo(() => {
    const schemaFields: Record<string, Yup.AnySchema> = {};
    let isSecondMemberSection = false;
    template_fields?.forEach((field: any) => {
      if (field.type === FIELDS_TYPE.STEP_BREAK) {
        const label = field.label?.toLowerCase() || "";
        if (label.includes("second")) {
          isSecondMemberSection = true;
        } else {
          isSecondMemberSection = false;
        }
        return;
      }
      let validator: any;
      switch (field.type) {
        case FIELDS_TYPE.TEXTFIELD:
        case FIELDS_TYPE.TEXTAREA:
        case FIELDS_TYPE.SELECT:
        case FIELDS_TYPE.RADIO:
        case FIELDS_TYPE.AUTOCOMPLETE:
        case FIELDS_TYPE.COUNTRY_SELECTOR: 
          validator = Yup.string();
          if (field.type === FIELDS_TYPE.TEXTFIELD) {
             const lbl = field.label?.toLowerCase() || "";
             if (lbl.includes("email")) {
                validator = validator.trim().matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i, "Please Enter Valid Email");
             } else if ((lbl.includes("name") || lbl.includes("city") || lbl.includes("state") || lbl.includes("country")) && !lbl.includes("school") && !lbl.includes("company") && !lbl.includes("file") && !lbl.includes("username")) {
                validator = validator.matches(/^[^\d]*$/, `${field.label} cannot contain numbers`);
             }
          }
          break;
        case FIELDS_TYPE.PASSWORD:
          validator = Yup.string();
          if (field.label?.toLowerCase().includes("confirm")) {
            const originalPasswordField = template_fields.find((f: any) => f.type === FIELDS_TYPE.PASSWORD && !f.label?.toLowerCase().includes("confirm"));
            if (originalPasswordField) {
              validator = validator.oneOf([Yup.ref(originalPasswordField.id)], `${field.label} must match ${originalPasswordField.label}`);
            }
          }
          break;
        case FIELDS_TYPE.TEL_INPUT:
          validator = Yup.string().test("is-valid-phone", "Invalid Phone Number", (value) => value ? matchIsValidTel(value) : false);
          break;
        case FIELDS_TYPE.NUMBER_FIELD:
        case FIELDS_TYPE.SLIDER:
        case FIELDS_TYPE.RATING: 
          validator = Yup.number();
          break;
        case FIELDS_TYPE.DATE_PICKER: 
          validator = Yup.string();
          break;
        case FIELDS_TYPE.FILE_UPLOAD: {
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
          break;
        }
        case FIELDS_TYPE.CHECKBOX:
        case FIELDS_TYPE.SWITCH: 
          validator = Yup.boolean();
          break;
        default: return;
      }
      if (field.required && validator) {
        if (isSecondMemberSection && addMemberField) {
          validator = validator.when(addMemberField.id, {
            is: "Yes",
            then: (schema: any) =>
              field.type === FIELDS_TYPE.CHECKBOX || field.type === FIELDS_TYPE.SWITCH
                ? schema.oneOf([true], "This field is required")
                : schema.required(`${field.label} is required`),
            otherwise: (schema: any) => schema.notRequired(),
          });
        } else {
          validator = 
            field.type === FIELDS_TYPE.CHECKBOX || field.type === FIELDS_TYPE.SWITCH
              ? validator.oneOf([true], "This field is required")
              : validator.required(`${field.label} is required`);
        }
      }
      if (validator) {
        schemaFields[field.id] = validator;
      }
    });

    const submissionData = entryData?.submission?.data?.data || entryData?.submission?.data || {};
    Object.keys(submissionData).forEach((key) => {
      if (key === "status" || key === "isDraft" || key.endsWith("_downloadUrl")) return;
      const exists = template_fields?.find((f: any) => f.id === key || f.label === key);
      if (!exists) {
        schemaFields[key] = Yup.string(); // Orphaned fields are treated as strings
      }
    });

    return Yup.object(schemaFields);
  }, [template_fields, addMemberField, entryData]);

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
        const formData = new FormData();
        for (const key in values) {
          if (values[key] !== undefined && values[key] !== null) {
            const value = values[key];
            const fieldDef = template_fields?.find((f: any) => f.id === key);
            
            if (fieldDef && (fieldDef.type === FIELDS_TYPE.FILE_UPLOAD || fieldDef.type === "file" || fieldDef.type === "image")) {
              if (value instanceof File) {
                formData.append(key, value);
              } else if (typeof value === "string") {
                const submissionData = entryData?.submission?.data?.data || entryData?.submission?.data || {};
                const originalValue = submissionData[key] || submissionData[fieldDef.label] || submissionData[fieldDef.label?.trim() || ""] || value;
                formData.append(key, originalValue);
              } else if (value === null) {
                formData.append(key, "");
              }
            } else {
              if (value !== "") {
                formData.append(key, value);
              } else {
                formData.append(key, "");
              }
            }
          }
        }
        await entryControllers.updateEntrySubmission(id, entryId, formData);
        showSnackbar("Entry updated successfully!", "success");
        router.push(`/contest-management/contests/${id}?tab=2`);
      } catch (err: any) {
        showSnackbar( err?.response?.data?.message || "Failed to update entry", "error" );
      }
    },
  });

  if (isPending || isEntryPending) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (!entryData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Entry not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => router.back()}
        >
          Back
        </Button>
      </Box>
    );
  }

  const visibleFields = getVisibleFields(formik.values);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumb
        title="Edit Entry"
        data={[
          {
            title: "Dashboard",
            href: "/dashboard",
          },
          {
            title: "Contest Management",
            href: "/contest-management/contests",
          },
          {
            title: "Contest Details",
            href: `/contest-management/contests/${id}`,
          },
          {
            title: "Edit Entry",
            href: "#",
          },
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
        <Typography variant="h5"
          sx={{
            mb: 4,
            fontFamily: montserrat.style.fontFamily,
            fontWeight: 600,
          }}
        >
          Edit Entry
        </Typography>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!formik.dirty) {
            showSnackbar("Please make some changes before updating", "warning");
            return;
          }
          formik.handleSubmit(e);
        }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={4}>
              {visibleFields?.map((val: any) => {
                if (val.type === FIELDS_TYPE.STEP_BREAK) {
                  return (
                    <Grid key={val.id} size={{ xs: 12}} >
                      <Typography variant="h6" sx={{ fontWeight: 600}}>
                        {val.label}
                      </Typography>
                    </Grid>
                  );
                }
                const isFullWidth = val.type === FIELDS_TYPE.TEXTBLOCK || val.type === FIELDS_TYPE.TEXTAREA || val.type === FIELDS_TYPE.SWITCH || val.type === FIELDS_TYPE.CHECKBOX || val.type === FIELDS_TYPE.RADIO;
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
                        type={ val.type === FIELDS_TYPE.NUMBER_FIELD ? "number" : val.type === FIELDS_TYPE.PASSWORD ? "password" : "text"}
                        multiline={val.type === FIELDS_TYPE.TEXTAREA}
                        minRows={val.type === FIELDS_TYPE.TEXTAREA ? 2 : undefined}
                        maxRows={val.type === FIELDS_TYPE.TEXTAREA ? 6 : undefined}
                        variant={val.variant}
                        placeholder={val.placeholder}
                        fullWidth
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
                        helperText={(getFormikError(formik, val.id) as string) || val.helperText }
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
                          name={val.id}
                          value={formik.values[val.id] || ""}
                          onChange={(value) => { formik.setFieldValue(val.id, value); formik.setFieldTouched(val.id, true, false); } }
                          onBlur={() => formik.setFieldTouched(val.id, true)}
                          error={Boolean(getFormikError(formik, val.id))}
                          defaultCountry={(val.config?.defaultCountry || 'IN') as any}
                          onlyCountries={val.config?.onlyCountries || undefined}
                        />
                        {getFormikError(formik, val.id) && (
                          <FormHelperText error> {getFormikError(formik, val.id) as string} </FormHelperText>
                        )}
                      </Box>
                    )}
                    {val.type === FIELDS_TYPE.DATE_PICKER && (
                      <DatePicker
                        label={val.label}
                        sx={{ width: "100%" }}
                        value={ formik.values[val.id] ? dayjs(formik.values[val.id]) : null}
                        minDate={val.label?.toLowerCase().includes("patent filing date") ? dayjs("2010-01-01") : undefined}
                        onChange={(newValue) => { formik.setFieldValue(val.id, newValue && newValue.isValid() ? newValue.toISOString() : null); formik.setFieldTouched(val.id, true, false); } }
                        slotProps={{
                          textField: {
                            error: Boolean(getFormikError(formik, val.id)),
                            helperText: (getFormikError(formik, val.id) as string) || val.helperText,
                            required: val.false,
                          },
                        }}
                      />
                    )}
                    {val.type === FIELDS_TYPE.SELECT && (
                      <FormControl fullWidth error={Boolean(getFormikError(formik, val.id))}>
                        <InputLabel>{val.label}</InputLabel>
                        <Select
                          label={val.label}
                          name={val.id}
                          value={formik.values[val.id] || ""}
                          onChange={(e) => { formik.handleChange(e); formik.setFieldTouched(val.id, true, false); }}
                          onBlur={formik.handleBlur}
                        >
                          {(val.options as string[])?.map((opt: string) => (
                            <MenuItem key={opt} value={opt}> {opt} </MenuItem>
                          ))}
                        </Select>
                        {getFormikError(formik, val.id) ||
                        val.helperText ? (
                          <FormHelperText error={Boolean(getFormikError(formik, val.id))}> {(getFormikError(formik, val.id) as string) || val.helperText} </FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                    {val.type === FIELDS_TYPE.AUTOCOMPLETE && (
                      <Autocomplete
                        options={(val.options as string[]) || []}
                        value={formik.values[val.id] || null}
                        onChange={(_, newValue) => {
                          formik.setFieldValue(val.id, newValue);
                          formik.setFieldTouched(val.id, true, false);
                        }}
                        onBlur={() => formik.setFieldTouched(val.id, true)}
                        renderInput={(params) => (
                          <TextField {...params} label={val.label}
                            error={Boolean(getFormikError(formik, val.id))}
                            helperText={(getFormikError(formik, val.id) as string) || val.helperText }
                            required={val.false}
                          />
                        )}
                      />
                    )}
                    {val.type === FIELDS_TYPE.COUNTRY_SELECTOR && (
                      <Autocomplete
                        options={countries}
                        autoHighlight
                        getOptionLabel={(option) => option.label}
                        value={ countries.find( (c) => c.label === formik.values[val.id] ) || null }
                        onChange={(_, newValue) => { formik.setFieldValue(val.id, newValue?.label || ""); formik.setFieldTouched(val.id, true, false); } }
                        onBlur={() => formik.setFieldTouched(val.id, true)}
                        renderInput={(params) => (
                          <TextField {...params} label={val.label}
                            error={Boolean(getFormikError(formik, val.id))}
                            helperText={(getFormikError(formik, val.id) as string) || val.helperText }
                            required={val.false}
                          />
                        )}
                      />
                    )}
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
                          <FormHelperText error sx={{ ml: 0 }}>
                            {getFormikError(formik, val.id) as string}
                          </FormHelperText>
                        )}
                      </Box>
                    )}
                    {val.type === FIELDS_TYPE.RADIO && (
                      <FormControl error={Boolean(getFormikError(formik, val.id))}>
                        <Typography sx={{mb: 1}}>
                          {val.label}
                        </Typography>
                        <RadioGroup
                          name={val.id}
                          value={formik.values[val.id] || ""}
                          onChange={(e) => { formik.handleChange(e); formik.setFieldTouched(val.id, true, false); }}
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
                          <FormHelperText>{getFormikError(formik, val.id) as string}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                    {(val.type === FIELDS_TYPE.SLIDER ||
                      val.type === FIELDS_TYPE.RATING) && (
                      <Box>
                        <Typography sx={{ mb: 1}}>
                          {val.label}
                        </Typography>
                        {val.type === FIELDS_TYPE.SLIDER ? (
                          <Slider
                            name={val.id}
                            value={formik.values[val.id] || 0}
                            onChange={(_, value) => { formik.setFieldValue(val.id, value); formik.setFieldTouched(val.id, true, false); }}
                            onBlur={() => formik.setFieldTouched(val.id, true)}
                          />
                        ) : (
                          <Rating
                            name={val.id}
                            value={Number(formik.values[val.id]) || 0}
                            onChange={(_, value) => { formik.setFieldValue(val.id, value); formik.setFieldTouched(val.id, true, false); } }
                            onBlur={() => formik.setFieldTouched(val.id, true)}
                          />
                        )}
                        {getFormikError(formik, val.id) && (
                          <FormHelperText error> {getFormikError(formik, val.id) as string} </FormHelperText>
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

              {/* Render Orphaned Fields */}
              {(() => {
                const submissionData = entryData?.submission?.data?.data || entryData?.submission?.data || {};
                const orphanKeys = Object.keys(submissionData).filter((key) => {
                  if (key === "status" || key === "isDraft" || key.endsWith("_downloadUrl")) return false;
                  return !template_fields?.find((f: any) => f.id === key || f.label === key);
                });

                if (orphanKeys.length === 0) return null;

                return (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "warning.main" }}>
                          Legacy Data Fields
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          These fields were submitted with an older version of the form template and are no longer in the active schema.
                        </Typography>
                      </Box>
                    </Grid>
                    {orphanKeys.map((key) => {
                      const isFile = typeof submissionData[key] === 'string' && submissionData[key].startsWith("http");
                      
                      if (isFile) {
                         const fileUrl = submissionData[key];
                         const isImage = (url: string) => /\.(jpeg|jpg|gif|png|webp|svg)(\?|$)/i.test(url);
                         return (
                           <Grid key={key} size={{ xs: 12, md: 6 }}>
                             <Box sx={{ p: 2, border: "1px dashed", borderColor: "warning.main", borderRadius: "10px", textAlign: "center" }}>
                               <Typography variant="body2" sx={{ fontWeight: 600, color: "warning.main", mb: 1 }}>
                                 Legacy File: {key}
                               </Typography>
                               <Box sx={{ display: "inline-flex", flexDirection: isImage(fileUrl) ? "column" : "row", alignItems: "center", gap: 1.5, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: "10px", bgcolor: "background.paper", position: 'relative' }}>
                                 {isImage(fileUrl) ? (
                                   <Box sx={{ borderRadius: 1.5, overflow: "hidden", position: 'relative', width: 150, height: 100, bgcolor: "rgba(0,0,0,0.02)" }}>
                                     <Image src={fileUrl} alt={key} fill style={{ objectFit: "cover" }} sizes="150px" />
                                   </Box>
                                 ) : (
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
                                     <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main", textDecoration: "underline", cursor: "pointer" }} onClick={() => window.open(fileUrl, "_blank")}>
                                       View Legacy File
                                     </Typography>
                                   </Box>
                                 )}
                                 <Typography variant="caption" noWrap sx={{ width: 150, textAlign: 'center', fontWeight: 600, color: "text.primary" }}>
                                   {key}
                                 </Typography>
                               </Box>
                             </Box>
                           </Grid>
                         );
                      }

                      return (
                        <Grid key={key} size={{ xs: 12, md: 6 }}>
                          <TextField
                            label={`Legacy Field: ${key}`}
                            variant="outlined"
                            fullWidth
                            name={key}
                            value={formik.values[key] || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={ formik.touched[key] && Boolean(formik.errors[key]) }
                            helperText={ formik.touched[key] && (formik.errors[key] as string) }
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "warning.main" },
                                "&:hover fieldset": { borderColor: "warning.dark" },
                                "&.Mui-focused fieldset": { borderColor: "warning.main" },
                              }
                            }}
                          />
                        </Grid>
                      );
                    })}
                  </>
                );
              })()}
            </Grid>
          </LocalizationProvider>
          <Box
            sx={{
              mt: 6,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button variant="outlined" onClick={() => router.back()}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              startIcon={
                formik.isSubmitting ? (<CircularProgress size={20} color="inherit" />) : (<SaveIcon />)
              }
            >
              {formik.isSubmitting ? "Updating..." : "Update Entry"}
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};
export default EditEntryForm;
