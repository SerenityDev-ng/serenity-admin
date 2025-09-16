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
  tasks: number;
  completed: number;
  revenue: number;
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
  year: number;
  month: number | null;
  service_type: string;
  statistics: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    cancelledTasks: number;
    totalRevenue: number;
    averageTaskValue: string;
    completionRate: string;
  };
  monthlyBreakdown: MonthlyTaskStats[];
  serviceBreakdown: {
    cleaning: {
      totalTasks: number;
      completedTasks: number;
      completionRate: string;
      totalRevenue: number;
      averageTaskValue: string;
    };
    laundry: {
      totalTasks: number;
      completedTasks: number;
      completionRate: string;
      totalRevenue: number;
      averageTaskValue: string;
    };
    repair: {
      totalTasks: number;
      completedTasks: number;
      completionRate: string | number;
      totalRevenue: number;
      averageTaskValue: string;
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
  start_date: string;
  end_date: string;
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
