import { UserRole, UserStatus } from "@/utils/enum";

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
