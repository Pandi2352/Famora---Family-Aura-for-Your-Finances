import { create } from 'zustand';
import { authApi } from '../lib/api/auth.api';
import type { AuthUser } from '../lib/api/auth.api';

export interface ExtendedUser extends AuthUser {
  phone: string | null;
}

interface AuthState {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  families: any[];

  login: (email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUser: (partial: Partial<ExtendedUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  families: [],

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user: { ...user, phone: null }, isAuthenticated: true });
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const res = await authApi.me();
      const data = res.data.data;
      set({
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          avatar: data.avatar,
          isTemporaryPassword: data.isTemporaryPassword,
        },
        families: data.families || [],
        isLoading: false,
      });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    await authApi.changePassword({ currentPassword, newPassword });
    set((state) =>
      state.user
        ? { user: { ...state.user, isTemporaryPassword: false } }
        : {},
    );
  },

  updateUser: (partial) => {
    set((state) =>
      state.user ? { user: { ...state.user, ...partial } } : {},
    );
  },

  logout: () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, families: [] });
  },
}));
