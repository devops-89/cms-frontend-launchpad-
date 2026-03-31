import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/context/SnackbarContext";
import { useForms, FormField, FieldType } from "@/context/FormContext";
import { FORM_CONTROLLERS } from "@/api/formControllers";

export const useFormTemplate = (initialData?: any) => {
  const { addForm } = useForms();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  
  const [formName, setFormName] = useState(initialData?.schema?.form_identity?.name || initialData?.name || "");
  const [formTitle, setFormTitle] = useState(initialData?.schema?.form_identity?.title || initialData?.title || "");
  const [fields, setFields] = useState<FormField[]>(initialData?.schema?.fields || initialData?.fields || []);
  const [loading, setLoading] = useState(false);
  const [isIdentityOpen, setIsIdentityOpen] = useState(false);
  const [newOptionTexts, setNewOptionTexts] = useState<Record<string, string>>({});
  
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fields.length > 0) {
      scrollEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [fields.length]);

  const addField = (type: FieldType, label: string) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `${label} ${fields.length + 1}`,
      required: false,
      variant: "outlined",
      options: ["select", "radio", "autocomplete"].includes(type)
        ? ["Option 1", "Option 2"]
        : [],
      config:
        type === "datePicker"
          ? { disablePast: false, disableFuture: false }
          : type === "telInput"
            ? { defaultCountry: "AE", onlyCountries: [] }
            : {},
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const updateFieldConfig = (id: string, key: string, value: any) => {
    setFields(
      fields.map((f) => {
        if (f.id === id) {
          return { ...f, config: { ...(f.config || {}), [key]: value } };
        }
        return f;
      }),
    );
  };

  const addOption = (fieldId: string) => {
    const optionText = newOptionTexts[fieldId]?.trim();
    if (!optionText) return;

    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const currentOptions = field.options || [];
    if (currentOptions.includes(optionText)) return;

    updateField(fieldId, { options: [...currentOptions, optionText] });
    setNewOptionTexts({ ...newOptionTexts, [fieldId]: "" });
  };

  const removeOption = (fieldId: string, optionToRemove: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    updateField(fieldId, {
      options: (field.options || []).filter((o) => o !== optionToRemove),
    });
  };

  const handleSave = async () => {
    if (!formName.trim() || !formTitle.trim()) {
      setIsIdentityOpen(true);
      showSnackbar("Please complete the form identity section.", "warning");
      return;
    }
    if (fields.length === 0) {
      showSnackbar("Please add at least one field.", "warning");
      return;
    }

    setLoading(true);

    const payload = {
      schema: {
        form_identity: {
          name: formName,
          title: formTitle,
          timestamp: new Date().toISOString(),
        },
        fields: fields.map((f) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          required: f.required,
          variant: f.variant || "outlined",
          placeholder: f.placeholder || "",
          helperText: f.helperText || "",
          options: f.options || [],
          config: f.config || {},
        })),
      },
    };

    try {
      console.log("SENDING TO BACKEND:", payload);
      
      let response;
      if (initialData?.id) {
        response = await FORM_CONTROLLERS.editTemplate(initialData.id, payload);
      } else {
        response = await FORM_CONTROLLERS.createForm(payload);
      }
      
      if (response.status === 201 || response.status === 200) {
        showSnackbar(
          initialData?.id ? "Template updated successfully!" : "Template created successfully!",
          "success"
        );
        
        if (!initialData?.id) {
          addForm({
            id: response.data?.id || Math.random().toString(36).substr(2, 9),
            name: formName,
            title: formTitle,
            fields,
          });
          router.push("/contest-management/contests/add-contest");
        } else {
          // If editing, maybe go back or refresh
          router.back();
        }
      }
    } catch (error: any) {
      console.error("FAILED TO SAVE TEMPLATE:", error);
      showSnackbar(error.response?.data?.message || "Failed to save template. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    formName,
    setFormName,
    formTitle,
    setFormTitle,
    fields,
    loading,
    isIdentityOpen,
    setIsIdentityOpen,
    newOptionTexts,
    setNewOptionTexts,
    scrollEndRef,
    addField,
    removeField,
    updateField,
    updateFieldConfig,
    addOption,
    removeOption,
    handleSave,
  };
};
