import { FormikProps } from "formik";

export const getFormikError = (formik: FormikProps<any>, fieldName: string) => {
  const error = formik.errors[fieldName];
  const isTouched = formik.touched[fieldName];
  const submitCount = formik.submitCount;

  if (error) {
    // Ensure error is a string
    const errorStr = typeof error === 'string' ? error : (Array.isArray(error) ? error[0] : String(error));
    
    // If it's a "required" error, only show after submit is clicked
    if (typeof errorStr === 'string' && errorStr.toLowerCase().includes("required")) {
      return submitCount > 0 ? errorStr : undefined;
    }
    // For format errors, show on touch/interaction
    return (isTouched || submitCount > 0) ? errorStr : undefined;
  }
  return undefined;
};
