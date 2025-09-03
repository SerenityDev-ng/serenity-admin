import axios from "axios";
import { useAuthStore } from "@/store/auth";

// Create axios instance
const api = axios.create({
  baseURL: "https://backend-c2f9.onrender.com/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().clearAuth();
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Export specific methods for convenience
export const { get, post, put, patch, delete: del } = api;
