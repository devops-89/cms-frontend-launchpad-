export type UserRole = "Admin" | "Judge" | "Participant" | "Moderator";
export type UserStatus = "Active" | "Inactive" | "Suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  joinedAt: string;
  lastLogin: string;
}
