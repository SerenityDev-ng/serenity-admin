import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getWorkerTasksAnalytics,
  getMonthlyTasksAnalytics,
  getPeriodicTasksAnalytics,
  exportWorkerTasksData,
  exportMonthlyTasksData,
  exportPeriodicTasksData,
  GetWorkerTasksParams,
  GetMonthlyTasksParams,
  GetPeriodicTasksParams,
} from "@/services/analytics";
import { AxiosError } from "axios";

export const useWorkerTasksAnalytics = (params: GetWorkerTasksParams = {}) => {
  return useQuery({
    queryKey: ["worker-tasks-analytics", params],
    queryFn: () => getWorkerTasksAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError) {
        // Don't retry on 4xx errors
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const useMonthlyTasksAnalytics = (
  params: GetMonthlyTasksParams = {}
) => {
  return useQuery({
    queryKey: ["monthly-tasks-analytics", params],
    queryFn: () => getMonthlyTasksAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError) {
        // Don't retry on 4xx errors
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const usePeriodicTasksAnalytics = (params: GetPeriodicTasksParams) => {
  return useQuery({
    queryKey: ["periodic-tasks-analytics", params],
    queryFn: () => getPeriodicTasksAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError) {
        // Don't retry on 4xx errors
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const useExportWorkerTasksData = () => {
  return useMutation({
    mutationFn: exportWorkerTasksData,
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError) {
        // Don't retry on 4xx errors
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const useExportMonthlyTasksData = () => {
  return useMutation({
    mutationFn: exportMonthlyTasksData,
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError) {
        // Don't retry on 4xx errors
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const useExportPeriodicTasksData = () => {
  return useMutation({
    mutationFn: exportPeriodicTasksData,
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError) {
        // Don't retry on 4xx errors
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};
