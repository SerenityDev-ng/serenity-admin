import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  houseTypesApi,
  GetHouseTypesParams,
  CreateHouseType,
} from '@/services/house-types';

// Custom retry function that doesn't retry on 4xx errors
const customRetry = (failureCount: number, error: unknown) => {
  // Don't retry on 4xx errors (client errors)
  if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
};

// Hook to get house types with filtering and pagination
export const useHouseTypes = (params: GetHouseTypesParams = {}) => {
  return useQuery({
    queryKey: ['house-types', params],
    queryFn: () => houseTypesApi.getHouseTypes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: customRetry,
  });
};

// Hook to create a new house type
export const useCreateHouseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHouseType) => houseTypesApi.createHouseType(data),
    onSuccess: () => {
      // Invalidate and refetch house types
      queryClient.invalidateQueries({ queryKey: ['house-types'] });
    },
    retry: customRetry,
  });
};