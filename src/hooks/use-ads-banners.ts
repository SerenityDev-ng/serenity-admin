import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  adsBannersApi,
  GetAdsBannersParams,
  CreateAdsBanner,
  UpdateAdsBanner,
} from '@/services/ads-banners';

// Custom retry function that doesn't retry on 4xx errors
const customRetry = (failureCount: number, error: unknown) => {
  // Don't retry on 4xx errors (client errors)
  if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
};

// Hook to get ads banners with filtering and pagination
export const useAdsBanners = (params: GetAdsBannersParams = {}) => {
  return useQuery({
    queryKey: ['ads-banners', params],
    queryFn: () => adsBannersApi.getAdsBanners(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: customRetry,
  });
};



// Hook to create a new ads banner
export const useCreateAdsBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdsBanner) => adsBannersApi.createAdsBanner(data),
    onSuccess: () => {
      // Invalidate and refetch ads banners
      queryClient.invalidateQueries({ queryKey: ['ads-banners'] });
    },
    retry: customRetry,
  });
};

// Hook to update an existing ads banner
export const useUpdateAdsBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bannerId, data }: { bannerId: string; data: UpdateAdsBanner }) =>
      adsBannersApi.updateAdsBanner(bannerId, data),
    onSuccess: () => {
      // Invalidate and refetch ads banners
      queryClient.invalidateQueries({ queryKey: ['ads-banners'] });
    },
    retry: customRetry,
  });
};

// Hook to delete an ads banner
export const useDeleteAdsBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerId: string) => adsBannersApi.deleteAdsBanner(bannerId),
    onSuccess: () => {
      // Invalidate and refetch ads banners
      queryClient.invalidateQueries({ queryKey: ['ads-banners'] });
    },
    retry: customRetry,
  });
};