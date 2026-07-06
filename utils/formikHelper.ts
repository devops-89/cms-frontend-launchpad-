import { FormikProps } from "formik";

export const getFormikError = (formik: FormikProps<any>, fieldName: string) => {
  const error = formik.errors[fieldName];
  const isTouched = formik.touched[fieldName];
  const submitCount = formik.submitCount;

  if (error) {
    // If it's a "required" error, only show after submit is clicked
    if (typeof error === 'string' && error.toLowerCase().includes("required")) {
      return submitCount > 0 ? error : undefined;
    }
    // For format errors (e.g., Only letters, invalid email, etc.), show on touch/interaction
    return (isTouched || submitCount > 0) ? error : undefined;
  }
  return undefined;
};
