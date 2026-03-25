"use client";

import React from "react";
import FormBuilder from "@/components/layouts/form-builder/FormBuilder";
import { useRouter } from "next/navigation";

const AddFormTemplatePage = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/form-builder");
  };

  return (
    <FormBuilder onBack={handleBack} />
  );
};

export default AddFormTemplatePage;
