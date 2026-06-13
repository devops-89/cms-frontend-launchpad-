"use client";

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
  const entryData = React.useMemo(() => {
    if (!data?.data?.entries || !entryId) return null;
    return data.data.entries.find((e: any) => e.id === entryId);
  }, [data?.data?.entries, entryId]);
  const initialValues = React.useMemo(() => {
    return (
      template_fields?.reduce((acc: any, field: any) => {
        const storedValue = entryData?.submission?.data?.[field.id];
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
        await entryControllers.updateEntrySubmission(id, entryId, values);
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
