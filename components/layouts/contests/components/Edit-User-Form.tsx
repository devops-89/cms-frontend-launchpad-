"use client";
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
import { MuiTelInput } from "mui-tel-input";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Close as CloseIcon } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormHelperText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { contestControllers } from "@/api/contestControllers";

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

  const template_fields = data?.data?.userLevelTemplate?.schema.fields;

  const { data: participantResponse, isPending: isParticipantPending } = useQuery({
    queryKey: ["Participant Details", id, participantId],
    queryFn: () => contestControllers.getParticipantById(id, participantId),
    enabled: !!id && !!participantId,
  });
  const participantData = participantResponse?.data;

  const initialValues = React.useMemo(() => {
    return (
      template_fields?.reduce((acc: any, field: any) => {
        let storedValue = participantData?.data?.[field.id] || participantData?.data?.[field.label] || participantData?.data?.[field.label?.trim() || ""];
        if (storedValue !== undefined) {
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
    return Yup.object().shape(
      template_fields?.reduce((acc: any, field: any) => {
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
        } else {
          validator = Yup.string();
        }

        if (field.required) {
          validator = validator.required(`${field.label} is required`);
        }
        acc[field.id] = validator;
        return acc;
      }, {}) || {}
    );
  }, [template_fields]);

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
        await contestControllers.updateParticipantDetails(formData, id, participantId);
        showSnackbar("User updated successfully!", "success");
        router.push(`/contest-management/contests/${id}`);
      } catch (err: any) {
        showSnackbar(
          err?.response?.data?.message || "Failed to update user",
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

  return (
    <Box>
      <Breadcrumb
        title="Edit User"
        data={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Contest Management", href: "/contest-management/contests" },
          {
            title: "Contest Details",
            href: `/contest-management/contests/${id}`,
          },
          { title: "Edit User", href: "#" },
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
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            fontFamily: montserrat.style.fontFamily,
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          Edit User
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={4}>
            {template_fields?.map((val: any, i: number) => (
              <Grid key={val.id} size={{ xs: 12, md: 6 }}>
                {(val.type === FIELDS_TYPE.TEXTFIELD ||
                  val.type === FIELDS_TYPE.NUMBER_FIELD ||
                  val.type === FIELDS_TYPE.PASSWORD) && (
                  <TextField
                    label={val.label}
                    type={
                      val.type === FIELDS_TYPE.NUMBER_FIELD
                        ? "number"
                        : val.type === FIELDS_TYPE.PASSWORD
                        ? "password"
                        : "text"
                    }
                    variant={val.variant}
                    placeholder={val.placeholder}
                    fullWidth
                    required={val.required}
                    name={val.id}
                    value={formik.values[val.id] || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched[val.id] && Boolean(formik.errors[val.id])
                    }
                    helperText={
                      (formik.touched[val.id] &&
                        (formik.errors[val.id] as string)) ||
                      val.helperText
                    }
                  />
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
                      onChange={(value) => formik.setFieldValue(val.id, value)}
                      onBlur={() => formik.setFieldTouched(val.id, true)}
                      error={
                        formik.touched[val.id] && Boolean(formik.errors[val.id])
                      }
                      defaultCountry={val.config?.defaultCountry}
                    />
                    {formik.touched[val.id] && formik.errors[val.id] && (
                      <FormHelperText error>
                        {formik.errors[val.id] as string}
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
                          error:
                            formik.touched[val.id] && Boolean(formik.errors[val.id]),
                          helperText:
                            (formik.touched[val.id] &&
                              (formik.errors[val.id] as string)) ||
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
                    error={
                      formik.touched[val.id] && Boolean(formik.errors[val.id])
                    }
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
                    {(formik.touched[val.id] && formik.errors[val.id]) ||
                    val.helperText ? (
                      <FormHelperText>
                        {(formik.touched[val.id] &&
                          (formik.errors[val.id] as string)) ||
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
                        error={
                          formik.touched[val.id] && Boolean(formik.errors[val.id])
                        }
                        helperText={
                          (formik.touched[val.id] &&
                            (formik.errors[val.id] as string)) ||
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
                          error={
                            formik.touched[val.id] && Boolean(formik.errors[val.id])
                          }
                          helperText={
                            (formik.touched[val.id] &&
                              (formik.errors[val.id] as string)) ||
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
                          error={
                            formik.touched[val.id] && Boolean(formik.errors[val.id])
                          }
                          helperText={
                            (formik.touched[val.id] &&
                              (formik.errors[val.id] as string)) ||
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
                    {formik.touched[val.id] && formik.errors[val.id] && (
                      <FormHelperText error>
                        {formik.errors[val.id] as string}
                      </FormHelperText>
                    )}
                  </Box>
                )}

                {val.type === FIELDS_TYPE.RADIO && (
                  <FormControl
                    component="fieldset"
                    error={
                      formik.touched[val.id] && Boolean(formik.errors[val.id])
                    }
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
                    {formik.touched[val.id] && formik.errors[val.id] && (
                      <FormHelperText>
                        {formik.errors[val.id] as string}
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
                    {formik.touched[val.id] && formik.errors[val.id] && (
                      <FormHelperText error>
                        {formik.errors[val.id] as string}
                      </FormHelperText>
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
            ))}
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
            onClick={() => formik.handleSubmit()}
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
