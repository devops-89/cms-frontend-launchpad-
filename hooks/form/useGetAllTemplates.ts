import { useQuery } from "@tanstack/react-query";
import { FORM_CONTROLLERS } from "@/api/formControllers";
import { FormDefinition } from "@/context/FormContext";

export const useGetAllTemplates = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const result = await FORM_CONTROLLERS.getAllTemplates();
      return result?.data?.data || result?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    templates: (data as FormDefinition[]) || [],
    isLoading,
    error: error ? (error as any)?.message : null,
    refetch,
  };
};
