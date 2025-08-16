import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, LoginCredentials, SignupCredentials } from "@/services/auth";
import { useAuthStore, AuthData } from "@/store/auth";
import { toast } from "sonner";

// Custom hook for login
export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data: AuthData) => {
      // Store auth data in zustand store
      setAuth(data);

      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Show success message
      toast.success("Login successful!");

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
}

// Custom hook for signup
export function useSignup() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignupCredentials) => authApi.signup(credentials),
    onSuccess: (data: AuthData) => {
      // Store auth data in zustand store
      setAuth(data);

      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Show success message
      toast.success("Account created successfully!");

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(error.message || "Signup failed. Please try again.");
    },
  });
}

// Custom hook for token refresh
export function useRefreshToken() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshToken: string) => authApi.refreshToken(refreshToken),
    onSuccess: (data: AuthData) => {
      // Update auth data with new tokens
      setAuth(data);

      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: () => {
      // If refresh fails, clear auth state
      clearAuth();
      queryClient.clear();
    },
  });
}
