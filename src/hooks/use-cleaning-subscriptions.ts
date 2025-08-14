import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCleaningSubscriptions,
  getSubscriptionDetails,
  getSubscriptionOrders,
  assignWorkerToSubscription,
  updateSubscriptionStatus,
  createCleaningSubscription,
  updateCleaningSubscription,
  deleteCleaningSubscription,
  getCleaningSubscriptionStats,
  GetCleaningSubscriptionsParams,
  GetSubscriptionOrdersParams,
  AssignWorkerRequest,
  UpdateSubscriptionStatusRequest,
  CleaningSubscription
} from '@/services/cleaning-subscriptions';
import { AxiosError } from 'axios';

export const useCleaningSubscriptions = (params: GetCleaningSubscriptionsParams = {}) => {
  return useQuery({
    queryKey: ['cleaning-subscriptions', params],
    queryFn: () => getCleaningSubscriptions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
};

export const useSubscriptionDetails = (subscriptionId: string) => {
  return useQuery({
    queryKey: ['subscription-details', subscriptionId],
    queryFn: () => getSubscriptionDetails(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 5 * 60 * 1000,
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
};

export const useSubscriptionOrders = (params: GetSubscriptionOrdersParams) => {
  return useQuery({
    queryKey: ['subscription-orders', params],
    queryFn: () => getSubscriptionOrders(params),
    enabled: !!params.subscriptionId,
    staleTime: 5 * 60 * 1000,
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
};

export const useAssignWorkerToSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, data }: { subscriptionId: string; data: AssignWorkerRequest }) => 
      assignWorkerToSubscription(subscriptionId, data),
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-details', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-orders'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-subscriptions'] });
    },
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
};

export const useUpdateSubscriptionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, data }: { subscriptionId: string; data: UpdateSubscriptionStatusRequest }) => 
      updateSubscriptionStatus(subscriptionId, data),
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-details', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-subscriptions'] });
    },
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
};

export const useCreateCleaningSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCleaningSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-subscriptions'] });
    },
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
};

export const useUpdateCleaningSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, subscription }: { id: string; subscription: Partial<CleaningSubscription> }) => 
      updateCleaningSubscription(id, subscription),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-details', id] });
    },
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
};

export const useDeleteCleaningSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCleaningSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-subscriptions'] });
    },
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
};

export const useCleaningSubscriptionStats = () => {
  return useQuery({
    queryKey: ['cleaning-subscription-stats'],
    queryFn: getCleaningSubscriptionStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
};