import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '@env';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenPayload,
  CurrentUser,
} from '@core/models/auth.model';
import { ApiResponse } from '@core/models/api-response.model';
import { UserRole } from '@core/models/enums';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth`;

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.authUrl}/login`, credentials)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  register(data: RegisterRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.authUrl}/register`,
      data,
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(`${this.authUrl}/logout`, { refreshToken })
        .subscribe();
    }
    this.clearStorage();
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.authUrl}/refresh-token`, {
        token: this.getToken(),
        refreshToken,
      })
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  getCurrentUser(): CurrentUser | null {
    const json = localStorage.getItem(STORAGE_KEYS.USER);
    if (!json) return null;
    try {
      return JSON.parse(json) as CurrentUser;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodeToken(token);
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  private handleAuthResponse(res: ApiResponse<AuthResponse>): void {
    if (!res.success || !res.data) return;
    const { token, refreshToken, username, role } = res.data;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    const payload = this.decodeToken(token);
    const user: CurrentUser = {
      id: payload?.sub ?? '',
      username,
      role: this.parseRole(role),
      employeeId: payload?.employeeId,
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  private clearStorage(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as TokenPayload;
    } catch {
      return null;
    }
  }

  private parseRole(role: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      Admin: UserRole.Admin,
      Manager: UserRole.Manager,
      Employee: UserRole.Employee,
    };
    return roleMap[role] ?? UserRole.Employee;
  }
}
