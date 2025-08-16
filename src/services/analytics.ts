import api from "@/lib/axios";
import { AxiosError } from "axios";

export interface Worker {
  _id: string;
  full_name: string;
  skill: string;
  totalJobs: number;
  completedJobs: number;
  lifetimeEarnings: number;
  averageRating: number;
  completionRate: number;
}

export interface MonthlyTaskStats {
  month: string;
  year: number;
  total_tasks: number;
  completed_tasks: number;
  total_revenue: number;
  average_task_value: number;
  growth_rate: number;
}

export interface PeriodicTaskStats {
  period: string;
  task_type: string;
  frequency: number;
  total_bookings: number;
  completion_rate: number;
  customer_satisfaction: number;
}

export interface WorkerTasksResponse {
  message: string;
  data: {
    workers: Worker[];
    summary: {
      totalWorkers: number;
      totalTasksCompleted: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
      totalWorkers: number;
    };
  };
}

export interface MonthlyTasksResponse {
  message: string;
  data: {
    stats: MonthlyTaskStats[];
    summary: {
      total_revenue: number;
      total_tasks: number;
      average_growth: number;
    };
  };
}

export interface PeriodicTasksResponse {
  message: string;
  data: {
    stats: PeriodicTaskStats[];
    summary: {
      most_popular_service: string;
      highest_satisfaction: string;
      best_completion_rate: string;
    };
  };
}

export interface GetWorkerTasksParams {
  page?: number;
  limit?: number;
  worker_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface GetMonthlyTasksParams {
  year?: number;
  months?: number;
}

export interface GetPeriodicTasksParams {
  period?: "daily" | "weekly" | "monthly";
  task_type?: string;
}

// Get worker task analytics
export const getWorkerTasksAnalytics = async (
  params: GetWorkerTasksParams = {}
): Promise<WorkerTasksResponse> => {
  const response = await api.get("/admin/analytics/worker-tasks", {
    params,
  });
  return response.data;
};

// Get monthly task analytics
export const getMonthlyTasksAnalytics = async (
  params: GetMonthlyTasksParams = {}
): Promise<MonthlyTasksResponse> => {
  const response = await api.get("/admin/analytics/monthly-tasks", {
    params,
  });
  return response.data;
};

// Get periodic task analytics
export const getPeriodicTasksAnalytics = async (
  params: GetPeriodicTasksParams = {}
): Promise<PeriodicTasksResponse> => {
  const response = await api.get("/admin/analytics/periodic-tasks", {
    params,
  });
  return response.data;
};

// Export worker tasks data
export const exportWorkerTasksData = async (
  params: GetWorkerTasksParams = {}
): Promise<Blob> => {
  const response = await api.get("/admin/analytics/worker-tasks/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};

// Export monthly tasks data
export const exportMonthlyTasksData = async (
  params: GetMonthlyTasksParams = {}
): Promise<Blob> => {
  const response = await api.get("/admin/analytics/monthly-tasks/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};

// Export periodic tasks data
export const exportPeriodicTasksData = async (
  params: GetPeriodicTasksParams = {}
): Promise<Blob> => {
  const response = await api.get("/admin/analytics/periodic-tasks/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};
