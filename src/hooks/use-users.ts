import { useQuery } from "@tanstack/react-query";
import { usersApi, GetUsersParams } from "@/services/users";
import { AxiosError } from "axios";

// Custom hook for fetching users
export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError) {
        // Don't retry on 4xx errors
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

// Hook for getting a single user by ID (if needed later)
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      // This would be implemented when we have a single user endpoint
      throw new Error('Single user endpoint not implemented yet');
    },
    enabled: !!userId,
  });
}