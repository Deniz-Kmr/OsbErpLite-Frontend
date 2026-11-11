import { UserRole } from '../enums';

export interface UserDto {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  employeeId: string | null;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: UserRole;
  employeeId?: string;
}

export interface UpdateUserRequest {
  role: UserRole;
  isActive: boolean;
  employeeId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}
