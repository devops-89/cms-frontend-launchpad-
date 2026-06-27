import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import * as Yup from "yup";

interface CountryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  isEdit?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(/^[A-Za-z\s]+$/, "Country Name can only contain alphabets")
    .required("Country Name is required"),
  code: Yup.string()
    .trim()
    .matches(/^[A-Za-z]+$/, "Country Code can only contain alphabets")
    .required("Country Code is required"),
  phoneCode: Yup.number()
    .typeError("Phone Code must be a valid number")
    .required("Phone Code is required"),
  currencyCode: Yup.string()
    .trim()
    .matches(/^[A-Za-z]+$/, "Currency Code can only contain alphabets")
    .required("Currency Code is required"),
  isActive: Yup.boolean(),
});

const defaultValues = {
  name: "",
  code: "",
  phoneCode: "",
  currencyCode: "",
  isActive: true,
};

const CountryModal: React.FC<CountryModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
}) => {
  const formik = useFormik({
    initialValues: initialValues || defaultValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: initialValues || defaultValues });
    }
  }, [open, initialValues]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>{isEdit ? "Edit Country" : "Add Country"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              required
              id="name"
              name="name"
              label="Country Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && (formik.errors.name as string)}
            />
            <TextField
              fullWidth
              required
              id="code"
              name="code"
              label="Country Code"
              value={formik.values.code}
              onChange={formik.handleChange}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && (formik.errors.code as string)}
            />
            <TextField
              fullWidth
              required
              id="phoneCode"
              name="phoneCode"
              label="Phone Code"
              value={formik.values.phoneCode}
              onChange={formik.handleChange}
              error={formik.touched.phoneCode && Boolean(formik.errors.phoneCode)}
              helperText={formik.touched.phoneCode && (formik.errors.phoneCode as string)}
            />
            <TextField
              fullWidth
              required
              id="currencyCode"
              name="currencyCode"
              label="Currency Code"
              value={formik.values.currencyCode}
              onChange={formik.handleChange}
              error={formik.touched.currencyCode && Boolean(formik.errors.currencyCode)}
              helperText={formik.touched.currencyCode && (formik.errors.currencyCode as string)}
            />

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isEdit && !formik.dirty}>
            {isEdit ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CountryModal;
