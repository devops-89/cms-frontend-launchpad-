import { ReactNode } from "react";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "dropdown"
  | "country"
  | "checkbox";

export interface DropdownOption {
  id: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  helperText?: string;
  defaultValue?: string;
  required: boolean;
  readOnly?: boolean;
  gridWidth?: "half" | "full";
  styling?: {
    borderRadius?: number;
  };
  min?: string;
  max?: string;
  options?: DropdownOption[];
}

export interface PaletteItem {
  type: FieldType;
  label: string;
  icon: ReactNode;
  description: string;
}
