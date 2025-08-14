import api from "@/lib/axios";
import { AuthResponse, AuthData } from "@/store/auth";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface SignupCredentials {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  sex: string;
  password: string;
}

// Auth API functions - pure functions without state management
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthData> => {
    const response = await api.post<AuthResponse>("/admin/login", credentials);

    if (response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid response format");
  },

  signup: async (credentials: SignupCredentials): Promise<AuthData> => {
    const response = await api.post<AuthResponse>("/admin/signup", credentials);

    if (response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid response format");
  },

  logout: async (): Promise<void> => {
    await api.post("/admin/logout");
  },

  refreshToken: async (refreshToken: string): Promise<AuthData> => {
    const response = await api.post<AuthResponse>("/admin/refresh-token", {
      refreshToken,
    });

    if (response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid refresh response");
  },
};

// Legacy AuthService class for backward compatibility
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthData> {
    return authApi.login(credentials);
  }

  static async signup(credentials: SignupCredentials): Promise<AuthData> {
    return authApi.signup(credentials);
  }

  static async logout(): Promise<void> {
    return authApi.logout();
  }

  static async refreshToken(refreshToken: string): Promise<AuthData> {
    return authApi.refreshToken(refreshToken);
  }
}
