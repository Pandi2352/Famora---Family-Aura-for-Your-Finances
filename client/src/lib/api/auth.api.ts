import { api } from './client';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  familyName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isTemporaryPassword: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data),

  login: (data: LoginPayload) =>
    api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data),

  me: () =>
    api.get<{ success: boolean; data: any }>('/auth/me'),

  changePassword: (data: ChangePasswordPayload) =>
    api.post<{ success: boolean; message: string }>('/auth/change-password', data),

  logout: () =>
    api.post('/auth/logout'),
};
