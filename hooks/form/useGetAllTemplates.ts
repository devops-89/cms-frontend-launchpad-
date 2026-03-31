import { useState, useEffect } from "react";
import { FORM_CONTROLLERS } from "@/api/formControllers";
import { FormDefinition } from "@/context/FormContext";

export const useGetAllTemplates = () => {
  const [templates, setTemplates] = useState<FormDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await FORM_CONTROLLERS.getAllTemplates();
      const data = result.data.data || result.data || [];
      setTemplates(data);
    } catch (err: any) {
      console.error("fetch templates error", err);
      setError(
        err?.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return { templates, isLoading, error, refetch: fetchTemplates };
};
