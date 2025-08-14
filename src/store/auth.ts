import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Admin {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  sex: string;
  isVerified: boolean;
  role: string;
  isActive: boolean;
}

export interface AuthData {
  admin: Admin;
  token: string;
  tokenExpTime: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  data: AuthData;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  tokenExpTime: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (authData: AuthData) => void;
  clearAuth: () => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      tokenExpTime: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (authData: AuthData) => {
        set({
          admin: authData.admin,
          token: authData.token,
          tokenExpTime: authData.tokenExpTime,
          refreshToken: authData.refreshToken,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        set({
          admin: null,
          token: null,
          tokenExpTime: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      getToken: () => {
        const state = get();
        return state.token;
      },
    }),
    {
      name: 'serenity-auth-storage',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        tokenExpTime: state.tokenExpTime,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);