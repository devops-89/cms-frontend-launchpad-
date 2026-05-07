"use client";

import React from "react";

import Breadcrumb from "@/components/widgets/Breadcrumb";

import { useSnackbar } from "@/context/SnackbarContext";

import { contestControllers } from "@/api/contestControllers";
import { entryControllers } from "@/api/entryControllers";

import { FIELDS_TYPE } from "@/utils/enum";
import { montserrat } from "@/utils/fonts";

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  TextField,
  Typography
} from "@mui/material";

import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";


import { useFormik } from "formik";
import * as Yup from "yup";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";


const EditEntryForm = () => {
  const { showSnackbar } =
    useSnackbar();

  const params = useParams();

  const searchParams =
    useSearchParams();

  const router = useRouter();

  const id = (
    Array.isArray(params?.id)
      ? params.id[0]
      : params?.id
  ) as string;

  const entryId =
    searchParams.get(
      "entryId",
    ) as string;

  const { data, isPending } =
    useQuery({
      queryKey: [
        "Contest Details",
        id,
      ],

      queryFn: () =>
        contestControllers.getContestDetails(
          id,
        ),

      enabled: !!id,
    });

  const template_fields =
    data?.data
      ?.entryLevelTemplate?.schema
      ?.fields;

  const entryData =
    React.useMemo(() => {
      if (
        !data?.data?.entries ||
        !entryId
      )
        return null;

      return data.data.entries.find(
        (e: any) =>
          e.id === entryId,
      );
    }, [
      data?.data?.entries,
      entryId,
    ]);

  const initialValues =
    React.useMemo(() => {
      return (
        template_fields?.reduce(
          (
            acc: any,
            field: any,
          ) => {
            const storedValue =
              entryData?.submission
                ?.data?.[field.id];

            if (
              storedValue !==
              undefined
            ) {
              acc[field.id] =
                storedValue;

              return acc;
            }

            acc[field.id] = "";

            if (
              field.type ===
                FIELDS_TYPE.CHECKBOX ||
              field.type ===
                FIELDS_TYPE.SWITCH
            ) {
              acc[field.id] =
                false;
            }

            if (
              field.type ===
                FIELDS_TYPE.SLIDER ||
              field.type ===
                FIELDS_TYPE.RATING
            ) {
              acc[field.id] = 0;
            }

            return acc;
          },
          {},
        ) || {}
      );
    }, [
      template_fields,
      entryData,
    ]);

  const validationSchema =
    React.useMemo(() => {
      return Yup.object().shape(
        template_fields?.reduce(
          (
            acc: any,
            field: any,
          ) => {
            let validator;

            if (
              field.type ===
                FIELDS_TYPE.NUMBER_FIELD ||
              field.type ===
                FIELDS_TYPE.SLIDER ||
              field.type ===
                FIELDS_TYPE.RATING
            ) {
              validator =
                Yup.number();
            } else if (
              field.type ===
                FIELDS_TYPE.CHECKBOX ||
              field.type ===
                FIELDS_TYPE.SWITCH
            ) {
              validator =
                Yup.boolean();
            } else {
              validator =
                Yup.string();
            }

            if (
              field.required
            ) {
              validator =
                validator.required(
                  `${field.label} is required`,
                );
            }

            acc[field.id] =
              validator;

            return acc;
          },
          {},
        ) || {},
      );
    }, [template_fields]);

  const formik = useFormik({
    initialValues,

    validationSchema,

    enableReinitialize: true,

    onSubmit: async (
      values,
    ) => {
      try {
        await entryControllers.updateEntrySubmission(
          id,
          entryId,
          values,
        );

        showSnackbar(
          "Entry updated successfully!",
          "success",
        );

        router.push(
          `/contest-management/contests/${id}`,
        );
      } catch (err: any) {
        showSnackbar(
          err?.response?.data
            ?.message ||
            "Failed to update entry",
          "error",
        );
      }
    },
  });

  if (isPending) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
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
        <Alert severity="warning">
          Entry not found
        </Alert>

        <Button
          startIcon={
            <ArrowBackIcon />
          }
          sx={{ mt: 2 }}
          onClick={() =>
            router.back()
          }
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumb
        title="Edit Entry"
        data={[
          {
            title:
              "Dashboard",
            href: "/dashboard",
          },
          {
            title:
              "Contest Management",
            href: "/contest-management/contests",
          },
          {
            title:
              "Contest Details",
            href: `/contest-management/contests/${id}`,
          },
          {
            title:
              "Edit Entry",
            href: "#",
          },
        ]}
      />

      <Card
        sx={{
          mt: 4,
          p: 4,
          boxShadow:
            "0px 0px 2px 2px #eeeeee",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            fontFamily:
              montserrat.style
                .fontFamily,
            fontWeight: 600,
          }}
        >
          Edit Entry
        </Typography>

        <LocalizationProvider
          dateAdapter={
            AdapterDayjs
          }
        >
          <Grid
            container
            spacing={4}
          >
            {template_fields?.map(
              (
                val: any,
              ) => (
                <Grid
                  key={val.id}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    label={val.label}
                    name={val.id}
                    value={
                      formik.values[
                        val.id
                      ] || ""
                    }
                    onChange={
                      formik.handleChange
                    }
                    onBlur={
                      formik.handleBlur
                    }
                    error={
                      formik.touched[
                        val.id
                      ] &&
                      Boolean(
                        formik.errors[
                          val.id
                        ],
                      )
                    }
                    helperText={
                      (formik.touched[
                        val.id
                      ] &&
                        (formik.errors[
                          val.id
                        ] as string)) ||
                      val.helperText
                    }
                  />
                </Grid>
              ),
            )}
          </Grid>
        </LocalizationProvider>

        <Box
          sx={{
            mt: 6,
            display: "flex",
            justifyContent:
              "flex-end",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              router.back()
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={
              formik.isSubmitting ? (
                <CircularProgress
                  size={20}
                  color="inherit"
                />
              ) : (
                <SaveIcon />
              )
            }
            onClick={() =>
              formik.handleSubmit()
            }
          >
            {formik.isSubmitting
              ? "Updating..."
              : "Update Entry"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default EditEntryForm;