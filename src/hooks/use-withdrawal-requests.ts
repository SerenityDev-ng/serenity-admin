import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  withdrawalRequestsApi,
  GetWithdrawalRequestsParams,
  ProcessWithdrawalRequest,
  CreateWithdrawalRequest,
} from '@/services/withdrawal-requests';

// Custom retry function that doesn't retry on 4xx errors
const customRetry = (failureCount: number, error: unknown) => {
  // Don't retry on 4xx errors (client errors)
  if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
};

// Hook to get withdrawal requests with filtering and pagination
export const useWithdrawalRequests = (params: GetWithdrawalRequestsParams = {}) => {
  return useQuery({
    queryKey: ['withdrawal-requests', params],
    queryFn: () => withdrawalRequestsApi.getWithdrawalRequests(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: customRetry,
  });
};

// Hook to get a specific withdrawal request
export const useWithdrawalRequest = (requestId: string) => {
  return useQuery({
    queryKey: ['withdrawal-request', requestId],
    queryFn: () => withdrawalRequestsApi.getWithdrawalRequest(requestId),
    enabled: !!requestId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: customRetry,
  });
};

// Hook to get withdrawal statistics
export const useWithdrawalStats = () => {
  return useQuery({
    queryKey: ['withdrawal-stats'],
    queryFn: () => withdrawalRequestsApi.getWithdrawalStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: customRetry,
  });
};

// Hook to create a new withdrawal request
export const useCreateWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWithdrawalRequest) => withdrawalRequestsApi.createWithdrawalRequest(data),
    onSuccess: () => {
      // Invalidate and refetch withdrawal requests
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-stats'] });
    },
    retry: customRetry,
  });
};

// Hook to process a withdrawal request (approve, reject, or mark as processed)
export const useProcessWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: ProcessWithdrawalRequest }) =>
      withdrawalRequestsApi.processWithdrawalRequest(requestId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch withdrawal requests
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-stats'] });
    },
    retry: customRetry,
  });
};

// Hook to delete a withdrawal request
export const useDeleteWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => withdrawalRequestsApi.deleteWithdrawalRequest(requestId),
    onSuccess: () => {
      // Invalidate and refetch withdrawal requests
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-stats'] });
    },
    retry: customRetry,
  });
};