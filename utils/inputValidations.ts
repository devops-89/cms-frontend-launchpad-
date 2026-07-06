import React from "react";

/**
 * Handles strictly validating input based on type before updating formik or local state.
 * @param e - The change event from the input field
 * @param handleChange - The formik or state change handler
 * @param setFieldTouched - Optional function to set field as touched
 * @param fieldType - "name" | "email" | "number" | "alphanumeric" | "address" | "default"
 */
export const handleStrictInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  setFieldTouched?: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void,
  fieldType: "name" | "email" | "number" | "alphanumeric" | "address" | "default" = "default"
) => {
  const val = e.target.value;

  if (fieldType === "name") {
    if (/^[a-zA-Z\s]*$/.test(val)) {
      handleChange(e);
    }
  } else if (fieldType === "email") {
    // Allow only valid email characters (no spaces)
    if (/^[a-zA-Z0-9._%+\-@]*$/.test(val)) {
      const atIndex = val.lastIndexOf("@");
      if (atIndex !== -1) {
        const domainPart = val.substring(atIndex + 1);
        const dotIndex = domainPart.lastIndexOf(".");
        
        if (dotIndex !== -1) {
          const tld = domainPart.substring(dotIndex).toLowerCase();
          const validTLDs = [
            ".com", ".org", ".in", ".net", ".edu", 
            ".co", ".io", ".gov", ".mil", ".biz", ".info"
          ];
          
          // Check if what the user is typing is a valid prefix of our allowed TLDs
          const isPrefixValid = validTLDs.some(validTld => validTld.startsWith(tld));
          
          if (isPrefixValid) {
            handleChange(e);
          }
        } else {
          handleChange(e);
        }
      } else {
        handleChange(e);
      }
    }
  } else if (fieldType === "number") {
    if (/^[0-9]*$/.test(val)) {
      handleChange(e);
    }
  } else if (fieldType === "alphanumeric") {
    if (/^[a-zA-Z0-9\s]*$/.test(val)) {
      handleChange(e);
    }
  } else if (fieldType === "address") {
    if (/^[a-zA-Z0-9\s,.\-/#]*$/.test(val)) {
      handleChange(e);
    }
  } else {
    // default, no strict validation
    handleChange(e);
  }

  if (setFieldTouched && e.target.name) {
    setFieldTouched(e.target.name, true, false);
  }
};
