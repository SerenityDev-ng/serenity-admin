import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, getBooking, createBooking, updateBooking, deleteBooking, GetBookingsParams, Booking } from '@/services/bookings';
import { AxiosError } from 'axios';

export const useBookings = (params: GetBookingsParams) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => getBookings(params),
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

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id),
    enabled: !!id,
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

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
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

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, booking }: { id: string; booking: Partial<Booking> }) => updateBooking(id, booking),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
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

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
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