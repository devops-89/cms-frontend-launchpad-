import { FieldType, FormField } from "./types";

export const uid = (): string => Math.random().toString(36).slice(2, 9);

/** Converts a FieldType to a human-readable default label, e.g. "country" → "Country Selector". */
const deriveLabel = (type: FieldType): string => {
  const map: Record<FieldType, string> = {
    text: "Text",
    email: "Email",
    password: "Password",
    number: "Number",
    textarea: "Text Area",
    dropdown: "Dropdown",
    country: "Country Selector",
    checkbox: "Checkbox",
  };
  return map[type];
};

export const createDefaultField = (type: FieldType): FormField => ({
  id: uid(),
  type,
  label: deriveLabel(type),
  placeholder: `Enter ${type}...`,
  helperText: "",
  defaultValue: "",
  required: false,
  readOnly: false,
  gridWidth: "full",
  styling: {
    borderRadius: 0,
  },
  min: "",
  max: "",
  options: type === "dropdown" ? [{ id: uid(), label: "Option 1" }] : undefined,
});

/** Swaps two elements in an array by index. Returns a new array. */
export const swapArrayItems = <T>(arr: T[], i: number, j: number): T[] => {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/** Shared MUI input sx override used across multiple sub-components. */
export const buildInputSx = (colors: any, borderRadius: number = 0) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: `${borderRadius}px`,
    "& fieldset": {
      borderColor: colors.BORDER,
      borderRadius: `${borderRadius}px`,
      transition: "all 0.2s ease",
    },
    "&:hover fieldset": { borderColor: `${colors.PRIMARY}60` },
    "&.Mui-focused fieldset": {
      borderColor: colors.PRIMARY,
      borderWidth: "1px",
    },
    "&.Mui-focused": {
      boxShadow: `0 4px 12px ${colors.PRIMARY}10`,
    },
  },
  "& .MuiInputLabel-root": {
    color: colors.TEXT_SECONDARY,
    fontWeight: 700,
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: colors.PRIMARY },
  "& .MuiOutlinedInput-input": {
    color: colors.TEXT_PRIMARY,
    fontSize: "0.95rem",
    fontWeight: 500,
  },
});
