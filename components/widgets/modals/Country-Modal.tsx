import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

interface CountryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  isEdit?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Country Name is required"),
  code: Yup.string().required("Country Code is required"),
  phoneCode: Yup.string().required("Phone Code is required"),
  currencyCode: Yup.string().required("Currency Code is required"),
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
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEdit ? "Edit Country" : "Add Country"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Country Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              id="code"
              name="code"
              label="Country Code"
              value={formik.values.code}
              onChange={formik.handleChange}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
            <TextField
              fullWidth
              id="phoneCode"
              name="phoneCode"
              label="Phone Code"
              value={formik.values.phoneCode}
              onChange={formik.handleChange}
              error={formik.touched.phoneCode && Boolean(formik.errors.phoneCode)}
              helperText={formik.touched.phoneCode && formik.errors.phoneCode}
            />
            <TextField
              fullWidth
              id="currencyCode"
              name="currencyCode"
              label="Currency Code"
              value={formik.values.currencyCode}
              onChange={formik.handleChange}
              error={formik.touched.currencyCode && Boolean(formik.errors.currencyCode)}
              helperText={formik.touched.currencyCode && formik.errors.currencyCode}
            />
            <FormControlLabel
              control={
                <Switch
                  id="isActive"
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CountryModal;
