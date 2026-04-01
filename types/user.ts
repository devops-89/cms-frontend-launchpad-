import { UserRole, UserStatus } from "@/utils/enum";
import { TextFieldVariants } from "@mui/material";

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  dateOfBirth?: string;
  grade?: string;
  schoolName?: string;
  countryOfResidence?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  joinedAt: string;
  lastLogin: string;
  bio?: string;
}

export interface RegisterParticipantPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  grade: string;
  password?: string;
  schoolName: string;
  country: string;
  role: string;
  confirmPassword?: string;
}

export interface LOGINRESPONSE {
  email: string;
  password: string;
}

export interface CountryType {
  code: string;
  label: string;
  phone: string;
  suggested?: boolean;
}

export interface TABLE_HEADER_DATA_PROPS {
  label: string;
}

export interface AddContestPayload {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  available_regions: string[];
  user_level_template_id: string;
  entry_level_template_id: string;
}

export interface CONTESTDETAILS {
  available_regions: string;
  description: string;
  end_date: string;
  entry_level_template: {
    id: string;
    createdAt: string;
    isActive: boolean;
    name: string;
    schema: {
      fields: {
        id: string;
        config?: any;
        label: string;
        required: boolean;
        type: string;
        variant: TextFieldVariants;
        options?: string[] | readonly CountryType[];
        placeholder?: string;
        helperText?: string;
        defaultCountry?: string;
      }[];
      form_identity: {
        name: string;
        timestamp: string;
        title: string;
      };
    };
  };
  entry_level_template_id: string;
  id: string;
  name: string;
  needs_moderation: number;
  start_date: string;
  status: UserStatus;
  total_entries: number;
  total_votes: number;
  userLevelTemplate: {
    id: string;
    createdAt: string;
    isActive: boolean;
    name: string;
    schema: {
      fields: {
        id: string;
        config?: any;
        label: string;
        required: boolean;
        type: string;
        variant: TextFieldVariants;
        options?: string[] | readonly CountryType[];
        placeholder?: string;
        helperText?: string;
        defaultCountry?: string;
      }[];
      form_identity: {
        name: string;
        timestamp: string;
        title: string;
      };
    };
  };
  user_level_template_id: string;
  participants: {
    id: string;
    contest_id: string;
    submission_id: string;
    status: string;
    joined_at: string;
    submission: {
      id: string;
      data: Record<string, string>;
      createdAt: string;
    };
  }[];
}

export interface JUDGEPAYLOAD {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  expertise: string[];
}
