"use client";
import { handleStrictInputChange } from "@/utils/inputValidations";
import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useSnackbar } from "@/context/SnackbarContext";
import { ContestParticipant } from "@/types/user";
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
import { parsePhoneNumberFromString, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
import { useParams, useRouter } from "next/navigation";
import React from "react";
import * as Yup from "yup";
import { getFormikError } from "@/utils/formikHelper";

const AddEntryForm = () => {
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string;
  const router = useRouter();
  const [selectedParticipant, setSelectedParticipant] = React.useState("");
  const { data, isPending } = useQuery({
    queryKey: ["Contest Details", id],
    queryFn: () => contestControllers.getContestDetails(id),
    enabled: !!id,
  });

  const template_fields = data?.data?.entryLevelTemplate?.schema.fields;
  const initialValues = React.useMemo(() => {
    return (
      template_fields?.reduce((acc: any, field: any) => {
        acc[field.id] = "";
        if ( field.type === FIELDS_TYPE.CHECKBOX || field.type === FIELDS_TYPE.SWITCH) {
          acc[field.id] = false;
        }
        if ( field.type === FIELDS_TYPE.SLIDER || field.type === FIELDS_TYPE.RATING) {
          acc[field.id] = 0;
        }
        return acc;
      }, {}) || {}
    );
  }, [template_fields]);
  const addMemberField = template_fields?.find((f: any) =>
      f.type === FIELDS_TYPE.SELECT && f.label?.toLowerCase().includes("add another member"),
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
        case FIELDS_TYPE.PASSWORD:
        case FIELDS_TYPE.SELECT:
        case FIELDS_TYPE.RADIO:
        case FIELDS_TYPE.AUTOCOMPLETE:
        case FIELDS_TYPE.COUNTRY_SELECTOR: 
          validator = Yup.string();
          if (field.type === FIELDS_TYPE.TEXTFIELD) {
             const lbl = field.label?.toLowerCase() || "";
             if (lbl.includes("email")) {
                validator = validator.trim().matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i, { message: "Please Enter Valid Email", excludeEmptyString: true });
             } else if ((lbl.includes("name") || lbl.includes("city") || lbl.includes("state") || lbl.includes("country")) && !lbl.includes("school") && !lbl.includes("company") && !lbl.includes("file") && !lbl.includes("username")) {
                validator = validator.matches(/^[^\d]*$/, { message: `${field.label} cannot contain numbers`, excludeEmptyString: true });
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
                : field.type === FIELDS_TYPE.FILE_UPLOAD
                ? schema.test("required", `${field.label} is required`, (value: any) => value !== "" && value !== null && value !== undefined)
                : schema.required(`${field.label} is required`),
            otherwise: (schema: any) => schema.notRequired(),
          });
        } else {
          validator = 
            field.type === FIELDS_TYPE.CHECKBOX || field.type === FIELDS_TYPE.SWITCH
              ? validator.oneOf([true], "This field is required")
              : field.type === FIELDS_TYPE.FILE_UPLOAD
              ? validator.test("required", `${field.label} is required`, (value: any) => value !== "" && value !== null && value !== undefined)
              : validator.required(`${field.label} is required`);
        }
      }
      if (validator) {
        schemaFields[field.id] = validator;
      }
    });
    return Yup.object(schemaFields);
  }, [template_fields, addMemberField]);

  // We define a function to compute visibleFields dynamically outside render
  // so we can use it during validation.
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
      console.log("FORM SUBMITTED");
      console.log(values);
      try {
        const participantId = selectedParticipant;
        console.log("Selected Participant", participantId);
        
        const formData = new FormData();
        formData.append("participant_id", participantId);
        for (const key in values) {
          if (values[key] !== undefined && values[key] !== null) {
            formData.append(key, values[key]);
          }
        }
        
        await entryControllers.createEntry(id, formData);
        showSnackbar("Entry added successfully!", "success");
        router.push(`/contest-management/contests/${id}?tab=2`);
      } catch (err: any) {
        console.log(err);
        showSnackbar(
          err?.response?.data?.message || "Failed to add entry",
          "error",
        );
      }
    },
  });
  React.useEffect(() => {
    // Dynamic branching handles showing/hiding step breaks.
    // However, if we need to clear out hidden values, we could do it here
    // based on visibleFields. For now, we leave this generic.
  }, [template_fields]);
  if (isPending) {
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
  if (!data && !isPending) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Contest not found. Please go back and try again.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => router.back()}
        >
          Back to Contests
        </Button>
      </Box>
    );
  }

  const visibleFields = getVisibleFields(formik.values);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumb
        title="Add Entry to Contest"
        data={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Contest Management", href: "/contest-management/contests" },
          {
            title: "Contest Details",
            href: `/contest-management/contests/${id}`,
          },
          { title: "Add Entry", href: "#" },
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
          Add New Entry
        </Typography>
        <form onSubmit={formik.handleSubmit} noValidate>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Select User</InputLabel>
                  <Select
                    value={selectedParticipant}
                    label="Select User"
                    onChange={(e) => { setSelectedParticipant(e.target.value)}}
                  >
                    {data?.data?.participants?.map((participant: ContestParticipant) => {
                      const userTemplateFields = data?.data?.userLevelTemplate?.schema?.fields || [];
                      const firstNameField = userTemplateFields.find((f: any) => {
                        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
                        return l.includes("firstname") || l === "first";
                      });
                      const lastNameField = userTemplateFields.find((f: any) => {
                        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
                        return l.includes("lastname") || l === "last";
                      });
                      const fullNameField = userTemplateFields.find((f: any) => {
                        const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
                        return l.includes("fullname") || l === "name" || (l.includes("name") && !l.includes("first") && !l.includes("last"));
                      });

                      const rawData = participant?.submission?.data;
                      const formData = rawData?.data || rawData || (participant as any).data || (participant as any).participant_profile_data || {};
                      let displayName = "";

                      if (firstNameField || lastNameField) {
                        const first = firstNameField ? formData[firstNameField.id] : "";
                        const last = lastNameField ? formData[lastNameField.id] : "";
                        displayName = `${first || ""} ${last || ""}`.trim();
                      }
                      
                      if (!displayName && fullNameField) {
                        displayName = formData[fullNameField.id];
                      }

                      if (!displayName) {
                        const fallback = userTemplateFields.find((f: any) => f.label?.toLowerCase().includes("name"));
                        if (fallback && formData[fallback.id]) {
                          displayName = formData[fallback.id];
                        } else {
                          displayName = formData.yg9snrxlh;
                        }
                      }
                      return (
                        <MenuItem key={participant.id} value={participant.id}>
                          {displayName || "Unnamed Participant"}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              {visibleFields?.map((val: any) => {
                if (val.type === FIELDS_TYPE.STEP_BREAK) {
                  return (
                    <Grid key={val.id} size={{ xs: 12 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                        <Typography sx={{mb: 1}}>
                          {val.label}{(val.required) && " *"}
                        </Typography>
                      </Box>
                    )}
                    {(val.type === FIELDS_TYPE.TEXTFIELD || val.type === FIELDS_TYPE.TEXTAREA || val.type === FIELDS_TYPE.NUMBER_FIELD || val.type === FIELDS_TYPE.PASSWORD) && (
                      <Box>
                      <TextField
                        label={val.label}
                        type={
                          val.type === FIELDS_TYPE.NUMBER_FIELD ? "number"
                          : val.type === FIELDS_TYPE.PASSWORD ? "password" : "text"
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
                      {(() => {
                        const countryCode = formik.values[`${val.id}_country`] || val.config?.defaultCountry || "IN";
                        const example = getExampleNumber(countryCode as any, examples);
                        const currentMaxLength = example?.formatInternational()?.length || 15;
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

                              const phoneVal = (formik.values[val.id] as string) || "";
                              const parsed = parsePhoneNumberFromString(phoneVal);
                              
                              if (parsed?.isValid()) {
                                e.preventDefault();
                                return;
                              }

                              const currentCountry = parsed?.country || val.config?.defaultCountry || "IN";
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
                            label={val.label}
                            variant={val.variant as any}
                            fullWidth
                            required={val.required}
                            forceCallingCode={true}
                            name={val.id}
                            value={formik.values[val.id] || ""}
                            onChange={(value, info) => { 
                              const cleanedValue = value.replace(/(?!^\+)\+/g, '');
                              
                              if (info.countryCode) {
                                formik.setFieldValue(`${val.id}_country`, info.countryCode);
                              }

                              const validationCountry = info.countryCode || formik.values[`${val.id}_country`] || val.config?.defaultCountry || "IN";
                              const ex = getExampleNumber(validationCountry as any, examples);
                              
                              const phoneVal = (formik.values[val.id] as string) || "";
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
                              
                              formik.setFieldValue(val.id, cleanedValue); 
                              formik.setFieldTouched(val.id, true, false); 
                            }}
                            onBlur={() => formik.setFieldTouched(val.id, true)}
                            error={Boolean(getFormikError(formik, val.id))}
                            defaultCountry={(() => {
                               let dc = formik.values[`${val.id}_country`];
                               if (!dc) dc = val.config?.defaultCountry || 'IN';
                               const onlyCountries = val.config?.onlyCountries;
                               if (onlyCountries?.length > 0 && !onlyCountries.includes(dc)) {
                                 return onlyCountries[0] as any;
                               }
                               return dc as any;
                            })()}
                            onlyCountries={val.config?.onlyCountries?.length > 0 ? val.config.onlyCountries : undefined}
                          />
                        );
                      })()}
                        {getFormikError(formik, val.id) && (
                          <FormHelperText error> {getFormikError(formik, val.id) as string} </FormHelperText>
                        )}
                      </Box>
                    )}
                    {val.type === FIELDS_TYPE.DATE_PICKER && (
                      <Box>
                        <DatePicker
                          label={val.label}
                          sx={{ width: "100%" }}
                          value={ formik.values[val.id] ? dayjs(formik.values[val.id]) : null }
                          minDate={val.label?.toLowerCase().includes("patent filing date") ? dayjs("2010-01-01") : undefined}
                          onChange={(newValue) => { formik.setFieldValue( val.id, newValue && newValue.isValid() ? newValue.toISOString() : null ); formik.setFieldTouched(val.id, true, false); } }
                          slotProps={{
                            textField: {
                              error: Boolean(getFormikError(formik, val.id)),
                              helperText: (getFormikError(formik, val.id) as string) || val.helperText,
                              required: val.required,
                            },
                          }}
                          disablePast={val.config?.disablePast === true || val.config?.disablePast === 'true'}
                          disableFuture={val.config?.disableFuture === true || val.config?.disableFuture === 'true'}
                        />
                      </Box>
                    )}
                    {val.type === FIELDS_TYPE.SELECT && (
                      <FormControl
                        fullWidth
                        variant={val.variant}
                        error={Boolean(getFormikError(formik, val.id))}
                        required={val.required}
                      >
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={val.label}
                            variant={val.variant}
                            placeholder={val.placeholder}
                            error={Boolean(getFormikError(formik, val.id))}
                            helperText={(getFormikError(formik, val.id) as string) || val.helperText }
                            required={val.required}
                          />
                        )}
                        value={formik.values[val.id] || null}
                        onChange={(_, newValue) => { formik.setFieldValue(val.id, newValue); formik.setFieldTouched(val.id, true, false); } }
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
                              helperText={(getFormikError(formik, val.id) as string) || val.helperText }
                              required={val.required}
                            />
                          )}
                          options={val.options}
                          value={formik.values[val.id] || null}
                          onChange={(_, newValue) => { formik.setFieldValue(val.id, newValue); formik.setFieldTouched(val.id, true, false); } }
                          onBlur={() => formik.setFieldTouched(val.id, true)}
                        />
                      ) : (
                        <Autocomplete
                          id={val.id}
                          options={countries}
                          autoHighlight
                          getOptionLabel={(option) => option.label}
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
                              label={val.label || "Choose a country"}
                              slotProps={{
                                htmlInput: {
                                  ...params.inputProps,
                                  autoComplete: "new-password",
                                },
                              }}
                              fullWidth
                              error={Boolean(getFormikError(formik, val.id))}
                              helperText={(getFormikError(formik, val.id) as string) || val.helperText }
                              required={val.required}
                            />
                          )}
                          value={
                            countries.find( (c) => c.label === formik.values[val.id]) || null }
                          onChange={(_, newValue) => { formik.setFieldValue(val.id, newValue?.label || ""); formik.setFieldTouched(val.id, true, false); } }
                          onBlur={() => formik.setFieldTouched(val.id, true)}
                        />
                      ))}
                    {(val.type === FIELDS_TYPE.CHECKBOX || val.type === FIELDS_TYPE.SWITCH) && (
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
                          label={<>{val.label}{(val.required) && " *"}</>}
                        />
                        {getFormikError(formik, val.id) && (
                          <FormHelperText error> {getFormikError(formik, val.id) as string} </FormHelperText>
                        )}
                      </Box>
                    )}
                    {val.type === FIELDS_TYPE.RADIO && (
                      <FormControl
                        component="fieldset"
                        error={Boolean(getFormikError(formik, val.id))}
                      >
                        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }} >
                          {val.label}
                        </Typography>
                        <RadioGroup
                          name={val.id}
                          value={formik.values[val.id] || ""}
                          onChange={(e) => { formik.handleChange(e); formik.setFieldTouched(val.id, true, false); }}
                          onBlur={formik.handleBlur}
                        >
                          {(val.options as string[])?.map((opt: string) => (
                            <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt}/>
                          ))}
                        </RadioGroup>
                        {getFormikError(formik, val.id) && (
                          <FormHelperText error>
                            {getFormikError(formik, val.id) as string} </FormHelperText>
                        )}
                      </FormControl>
                    )}
                    {(val.type === FIELDS_TYPE.SLIDER || val.type === FIELDS_TYPE.RATING) && (
                      <Box sx={{ px: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }} >
                          {val.label}
                        </Typography>
                        {val.type === FIELDS_TYPE.SLIDER ? (
                          <Slider
                            name={val.id}
                            value={formik.values[val.id] || 0}
                            onChange={(_, value) => { formik.setFieldValue(val.id, value); formik.setFieldTouched(val.id, true, false); }}
                            onBlur={() => formik.setFieldTouched(val.id, true)}
                            valueLabelDisplay="auto"
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
                                    label={`${val.label}${val.required ? " *" : ""}`} 
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
          <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.back()}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              startIcon={ formik.isSubmitting ? ( <CircularProgress size={20} color="inherit" /> ) : ( <SaveIcon />) }
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
              {formik.isSubmitting ? "Adding..." : "Add Entry"}
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default AddEntryForm;
