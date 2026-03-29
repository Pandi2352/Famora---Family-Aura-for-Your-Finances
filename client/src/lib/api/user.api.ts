import { api } from './client';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7000';
const UPLOADS_BASE = API_BASE.replace('/api', '');

export function getAvatarUrl(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `${UPLOADS_BASE}/${avatar}`;
}

export const userApi = {
  updateProfile: (data: UpdateProfilePayload) =>
    api.patch<{ success: boolean; data: ProfileData }>('/user/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ success: boolean; data: { avatar: string } }>('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  removeAvatar: () =>
    api.delete<{ success: boolean; data: { avatar: null } }>('/user/avatar'),
};
