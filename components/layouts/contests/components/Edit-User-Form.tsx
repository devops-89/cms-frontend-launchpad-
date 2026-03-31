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
  Autocomplete,
  Alert,
  CircularProgress,
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
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormHelperText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
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

  const participantData = React.useMemo(() => {
    if (!data?.data?.participants || !participantId) return null;
    return data.data.participants.find((p: any) => p.id === participantId);
  }, [data?.data?.participants, participantId]);

  const initialValues = React.useMemo(() => {
    return (
      template_fields?.reduce((acc: any, field: any) => {
        const storedValue = participantData?.submission?.data?.[field.id];

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
        await contestControllers.updateParticipantDetails(values, id, participantId);
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

  if (isPending) {
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
                        formik.setFieldValue(val.id, newValue?.toISOString())
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
