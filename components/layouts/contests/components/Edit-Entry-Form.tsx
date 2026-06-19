"use client";

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
  InsertDriveFile,
} from "@mui/icons-material";
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
import { MuiTelInput } from "mui-tel-input";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import * as Yup from "yup";

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
  const template_fields = data?.data?.entryLevelTemplate?.schema?.fields;
  
  const { data: entryResponse, isPending: isEntryPending } = useQuery({
    queryKey: ["Entry Details", id, entryId],
    queryFn: () => entryControllers.getEntryById(id, entryId),
    enabled: !!id && !!entryId,
  });
  const entryData = entryResponse?.data;
  const initialValues = React.useMemo(() => {
    return (
      template_fields?.reduce((acc: any, field: any) => {
        let storedValue = entryData?.submission?.data?.[field.id] || entryData?.submission?.data?.[field.label] || entryData?.submission?.data?.[field.label?.trim() || ""];

        if (field.type === FIELDS_TYPE.FILE_UPLOAD && (entryData?.submission?.data?.[`${field.id}_downloadUrl`] || entryData?.submission?.data?.[`${field.label}_downloadUrl`])) {
          storedValue = entryData.submission.data[`${field.id}_downloadUrl`] || entryData.submission.data[`${field.label}_downloadUrl`];
        }

        if (storedValue !== undefined) {
          acc[field.id] = storedValue;
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
      }, {}) || {}
    );
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
        case FIELDS_TYPE.PASSWORD:
        case FIELDS_TYPE.TEL_INPUT:
        case FIELDS_TYPE.SELECT:
        case FIELDS_TYPE.RADIO:
        case FIELDS_TYPE.AUTOCOMPLETE:
        case FIELDS_TYPE.COUNTRY_SELECTOR: validator = Yup.string();
          break;
        case FIELDS_TYPE.NUMBER_FIELD:
        case FIELDS_TYPE.SLIDER:
        case FIELDS_TYPE.RATING: validator = Yup.number();
          break;
        case FIELDS_TYPE.DATE_PICKER: validator = Yup.string();
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
        case FIELDS_TYPE.SWITCH: validator = Yup.boolean();
          break;
        default: return;
      }
      if (field.required) {
        if (isSecondMemberSection && addMemberField) {
          validator = validator.when(addMemberField.id, {
            is: "Yes",
            then: (schema: any) =>
              schema.required(`${field.label} is required`),
            otherwise: (schema: any) => schema.notRequired(),
          });
        } else {
          validator = validator.required(`${field.label} is required`);
        }
      }
      schemaFields[field.id] = validator;
    });
    return Yup.object(schemaFields);
  }, [template_fields, addMemberField]);
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        for (const key in values) {
          if (values[key] !== undefined && values[key] !== null) {
            formData.append(key, values[key]);
          }
        }
        await entryControllers.updateEntrySubmission(id, entryId, formData);
        showSnackbar("Entry updated successfully!", "success");
        router.push(`/contest-management/contests/${id}`);
      } catch (err: any) {
        showSnackbar( err?.response?.data?.message || "Failed to update entry", "error" );
      }
    },
  });
  const showMember2 = addMemberField && formik.values[addMemberField.id] === "Yes";
  React.useEffect(() => {
    if (!showMember2) {
      template_fields?.forEach((field: any) => {
        if (field.label?.toLowerCase().includes("member 2")) {
          formik.setFieldValue(field.id, "");
        }
      });
    }
  }, [showMember2, template_fields]);
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
  let hideMember2 = false;
  return (
    <Box>
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
        <form onSubmit={formik.handleSubmit}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={4}>
              {template_fields?.map((val: any) => {
                if (val.type === FIELDS_TYPE.STEP_BREAK) {
                  const label = val.label?.toLowerCase() || "";
                  if (label.includes("second")) {
                    hideMember2 = !showMember2;
                  } else if (hideMember2) {
                    hideMember2 = false;
                  }
                }
                if (hideMember2) return null;
                if (val.type === FIELDS_TYPE.STEP_BREAK) {
                  return (
                    <Grid key={val.id} size={{ xs: 12}} >
                      <Typography variant="h6" sx={{ fontWeight: 600}}>
                        {val.label}
                      </Typography>
                    </Grid>
                  );
                }
                return (
                  <Grid key={val.id} size={{ xs: 12, md: 6}}>
                    {(val.type === FIELDS_TYPE.TEXTFIELD ||
                      val.type === FIELDS_TYPE.NUMBER_FIELD ||
                      val.type === FIELDS_TYPE.PASSWORD) && (
                      <TextField
                        label={val.label}
                        type={ val.type === FIELDS_TYPE.NUMBER_FIELD ? "number" : val.type === FIELDS_TYPE.PASSWORD ? "password" : "text"}
                        variant={val.variant}
                        placeholder={val.placeholder}
                        fullWidth
                        name={val.id}
                        value={formik.values[val.id] || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={ formik.touched[val.id] && Boolean(formik.errors[val.id]) }
                        helperText={ (formik.touched[val.id] && (formik.errors[val.id] as string)) || val.helperText }
                      />
                    )}
                    {val.type === FIELDS_TYPE.TEL_INPUT && (
                      <Box>
                        <MuiTelInput
                          label={val.label}
                          variant={val.variant}
                          fullWidth
                          name={val.id}
                          value={formik.values[val.id] || ""}
                          onChange={(value) => formik.setFieldValue(val.id, value) }
                          onBlur={() => formik.setFieldTouched(val.id, true)}
                          error={ formik.touched[val.id] && Boolean(formik.errors[val.id]) }
                          defaultCountry={val.config?.defaultCountry}
                        />
                        {formik.touched[val.id] && formik.errors[val.id] && (
                          <FormHelperText error> {formik.errors[val.id] as string} </FormHelperText>
                        )}
                      </Box>
                    )}
                    {val.type === FIELDS_TYPE.DATE_PICKER && (
                      <DatePicker
                        label={val.label}
                        sx={{ width: "100%" }}
                        value={ formik.values[val.id] ? dayjs(formik.values[val.id]) : null}
                        onChange={(newValue) => formik.setFieldValue(val.id, newValue && newValue.isValid() ? newValue.toISOString() : null) }
                      />
                    )}
                    {val.type === FIELDS_TYPE.SELECT && (
                      <FormControl fullWidth>
                        <InputLabel>{val.label}</InputLabel>
                        <Select
                          label={val.label}
                          name={val.id}
                          value={formik.values[val.id] || ""}
                          onChange={formik.handleChange}
                        >
                          {(val.options as string[])?.map((opt: string) => (
                            <MenuItem key={opt} value={opt}> {opt} </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {val.type === FIELDS_TYPE.AUTOCOMPLETE && (
                      <Autocomplete
                        options={(val.options as string[]) || []}
                        value={formik.values[val.id] || null}
                        onChange={(_, newValue) =>
                          formik.setFieldValue(val.id, newValue)
                        }
                        renderInput={(params) => (
                          <TextField {...params} label={val.label} />
                        )}
                      />
                    )}
                    {val.type === FIELDS_TYPE.COUNTRY_SELECTOR && (
                      <Autocomplete
                        options={countries}
                        autoHighlight
                        getOptionLabel={(option) => option.label}
                        value={ countries.find( (c) => c.label === formik.values[val.id] ) || null }
                        onChange={(_, newValue) => formik.setFieldValue(val.id, newValue?.label || "")}
                        renderInput={(params) => (
                          <TextField {...params} label={val.label} />
                        )}
                      />
                    )}
                    {(val.type === FIELDS_TYPE.CHECKBOX ||
                      val.type === FIELDS_TYPE.SWITCH) && (
                      <FormControlLabel
                        control={
                          val.type === FIELDS_TYPE.CHECKBOX ? (
                            <Checkbox
                              checked={Boolean(formik.values[val.id])}
                              onChange={formik.handleChange}
                              name={val.id}
                            />
                          ) : (
                            <Switch
                              checked={Boolean(formik.values[val.id])}
                              onChange={formik.handleChange}
                              name={val.id}
                            />
                          )
                        }
                        label={val.label}
                      />
                    )}
                    {val.type === FIELDS_TYPE.RADIO && (
                      <FormControl>
                        <Typography sx={{mb: 1}}>
                          {val.label}
                        </Typography>
                        <RadioGroup
                          name={val.id}
                          value={formik.values[val.id] || ""}
                          onChange={formik.handleChange}
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
                            value={formik.values[val.id] || 0}
                            onChange={(_, value) =>
                              formik.setFieldValue(val.id, value)
                            }
                          />
                        ) : (
                          <Rating
                            value={Number(formik.values[val.id]) || 0}
                            onChange={(_, value) => formik.setFieldValue(val.id, value) }
                          />
                        )}
                      </Box>
                    )}
                    {val.type === FIELDS_TYPE.FILE_UPLOAD && (
                      <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: "10px", textAlign: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {val.label} {val.required && "*"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                          {val.config?.allowedExtensions ? `Allowed: ${val.config?.allowedExtensions}` : "All files allowed"} 
                          {val.config?.maxSize ? ` (Max: ${val.config?.maxSize}MB)` : ""}
                        </Typography>
                        {formik.values[val.id] ? (() => {
                          const fileValue = formik.values[val.id];
                          const isFileObj = fileValue instanceof File;
                          const fileUrl = isFileObj ? URL.createObjectURL(fileValue) : (typeof fileValue === 'string' ? fileValue : '');
                          const isImage = (url: string) => /\.(jpeg|jpg|gif|png|webp|svg)(\?|$)/i.test(url);
                          const getFileName = (url: string) => {
                            if (isFileObj) return fileValue.name;
                            try {
                              const urlObj = new URL(url);
                              const segments = urlObj.pathname.split('/');
                              const decoded = decodeURIComponent(segments.pop() || "");
                              const parts = decoded.split('-');
                              return parts.length > 2 ? parts.slice(2).join('-') : decoded;
                            } catch (e) {
                              return "Document";
                            }
                          };

                          const fileName = getFileName(fileUrl);
                          const isImg = isFileObj ? fileValue.type.startsWith('image/') : (typeof fileValue === 'string' && isImage(fileValue));

                          return (
                            <Box sx={{ display: "inline-flex", flexDirection: isImg ? "column" : "row", alignItems: "center", gap: 1.5, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: "10px", bgcolor: "background.paper", mt: 1, position: 'relative' }}>
                              {isImg ? (
                                <Box sx={{ borderRadius: 1.5, overflow: "hidden", position: 'relative', width: 150, height: 100, bgcolor: "rgba(0,0,0,0.02)" }}>
                                  <Image src={fileUrl} alt={fileName} fill style={{ objectFit: "cover" }} sizes="150px" />
                                </Box>
                              ) : typeof formik.values[val.id] === 'string' ? (
                                formik.values[val.id].match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i) ? (
                                  <Box sx={{ borderRadius: 1, overflow: "hidden", display: "flex", position: 'relative', width: 150, height: 100 }}>
                                    <Image src={formik.values[val.id]} alt="File" fill style={{ objectFit: "contain" }} sizes="150px" />
                                  </Box>
                                ) : (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
                                    <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 1, color: "primary.main", flexShrink: 0 }}>
                                      <InsertDriveFile sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                                      <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 600 }}>
                                        Document File
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main", textDecoration: "underline", cursor: "pointer" }} onClick={() => window.open(formik.values[val.id], "_blank")}>
                                        View File
                                      </Typography>
                                    </Box>
                                  </Box>
                                )
                              ) : (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 1.5, bgcolor: "rgba(99, 102, 241, 0.08)", color: "primary.main" }}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </Box>
                              )}
                              
                              <Typography variant="caption" noWrap sx={{ width: 150, textAlign: 'center', fontWeight: 600, color: "text.primary" }}>
                                {fileName}
                              </Typography>

                              <IconButton size="small" onClick={() => formik.setFieldValue(val.id, "")} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' }, p: 0.5, boxShadow: 2, zIndex: 2 }}>
                                <CloseIcon sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </Box>
                          );
                        })() : (
                          <Button variant="outlined" component="label" size="small">
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
                        )}
                        {formik.touched[val.id] && formik.errors[val.id] && (
                          <FormHelperText error sx={{ textAlign: "center", mt: 1 }}>
                            {formik.errors[val.id] as string}
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
