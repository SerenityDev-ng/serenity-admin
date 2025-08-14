import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  workersApi, 
  GetWorkersParams, 
  GetAssignedJobsParams, 
  GetJobHistoryParams, 
  Worker 
} from '@/services/workers';
import { AxiosError } from 'axios';

// Custom retry function for API calls
const customRetry = (failureCount: number, error: unknown) => {
  if (error instanceof AxiosError) {
    // Don't retry on 4xx errors
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      return false;
    }
  }
  return failureCount < 2;
};

export const useWorkers = (params: GetWorkersParams = {}) => {
  return useQuery({
    queryKey: ['workers', params],
    queryFn: () => workersApi.getWorkers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: customRetry,
  });
};

export const useWorker = (id: string) => {
  return useQuery({
    queryKey: ['worker', id],
    queryFn: () => workersApi.getWorker(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: customRetry,
  });
};

export const useCreateWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workersApi.createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    retry: customRetry,
  });
};

export const useUpdateWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, worker }: { id: string; worker: Partial<Worker> }) => workersApi.updateWorker(id, worker),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['worker', id] });
    },
    retry: customRetry,
  });
};

export const useDeleteWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workersApi.deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    retry: customRetry,
  });
};

// New hooks for worker job management
export const useAssignedJobs = (params: GetAssignedJobsParams = {}) => {
  return useQuery({
    queryKey: ['assigned-jobs', params],
    queryFn: () => workersApi.getAssignedJobs(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: customRetry,
  });
};

export const useCurrentJob = () => {
  return useQuery({
    queryKey: ['current-job'],
    queryFn: () => workersApi.getCurrentJob(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: customRetry,
  });
};

export const useJobHistory = (params: GetJobHistoryParams = {}) => {
  return useQuery({
    queryKey: ['job-history', params],
    queryFn: () => workersApi.getJobHistory(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: customRetry,
  });
};