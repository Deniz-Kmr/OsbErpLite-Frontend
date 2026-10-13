import { UserRole } from './enums';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
  employeeId?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string;
  role: string;
  expiresAt: string;
}

export interface TokenPayload {
  sub: string;
  unique_name: string;
  role: string;
  employeeId?: string;
  exp: number;
  iat: number;
}

export interface CurrentUser {
  id: string;
  username: string;
  role: UserRole;
  employeeId?: string;
}
