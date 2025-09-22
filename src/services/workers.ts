import api from "@/lib/axios";
import { AxiosError } from "axios";

export interface Worker {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  skill: string;
  isAvailable: boolean;
  isAssigned: boolean;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  address: any;
}

export interface WorkerJob {
  _id: string;
  job_type: string;
  booking_status: string;
  total_amount: string;
  assignment_date: any;
  assignment_time: any;
  customer_details: any;
  job_address: any;
  scheduled_date: string;
  notes: string;
}

export interface AssignedJobsResponse {
  message: string;
  data: {
    assigned_jobs: WorkerJob[];
    summary: {
      total_jobs: number;
      pending_jobs: number;
      active_jobs: number;
      completed_jobs: number;
    };
    pagination: any;
  };
}

export interface CurrentJobResponse {
  message: string;
  data: {
    current_job: WorkerJob;
  };
}

export interface JobHistoryResponse {
  message: string;
  data: {
    job_history: WorkerJob[];
    summary: {
      total_jobs: number;
      total_earnings: number;
      average_rating: number;
    };
    pagination: object;
  };
}

export interface GetAssignedJobsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  job_type?: "cleaning" | "laundry" | "repair";
}

export interface GetJobHistoryParams {
  page?: number;
  limit?: number;
  job_type?: "cleaning" | "laundry" | "repair";
  start_date?: string;
  end_date?: string;
}

export interface WorkersResponse {
  message: string;
  data: {
    workers: Worker[];
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

export interface GetWorkersParams {
  page?: number;
  limit?: number;
  search?: string;
  skill?: string;
  isAvailable?: boolean;
  isVerified?: boolean;
  isAssigned?: boolean;
  isActive?: boolean;
}

// Worker API functions
export const workersApi = {
  // Get all workers
  getWorkers: async (
    params: GetWorkersParams = {}
  ): Promise<WorkersResponse> => {
    const response = await api.get("/admin/workers", { params });
    // Map backend identifier to `id` to keep UI consistent
    const raw = response.data as any;
    const mapped = {
      ...raw,
      data: {
        ...raw?.data,
        workers: (raw?.data?.workers || []).map((w: any) => ({
          ...w,
          id: String(w?.id ?? w?._id),
        })),
      },
    } as WorkersResponse;
    return mapped;
  },

  // Get single worker
  getWorker: async (id: string): Promise<{ message: string; data: Worker }> => {
    const response = await api.get(`/admin/workers/${id}`);
    const raw = response.data as any;
    const worker = raw?.data;
    return {
      ...raw,
      data: {
        ...worker,
        id: String(worker?.id ?? worker?._id),
      },
    } as { message: string; data: Worker };
  },

  // Create worker
  createWorker: async (
    worker: Partial<Worker>
  ): Promise<{ message: string; data: Partial<Worker> }> => {
    const response = await api.post("/worker/signup", worker);
    return response.data.data.worker;
  },

  // Update worker
  updateWorker: async (
    id: string,
    worker: Partial<Worker>
  ): Promise<{ message: string; data: Worker }> => {
    const response = await api.put(`/admin/workers/${id}`, worker);
    return response.data;
  },

  // Delete worker
  deleteWorker: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/workers/${id}`);
    return response.data;
  },

  // Get worker's assigned jobs
  getAssignedJobs: async (
    params: GetAssignedJobsParams = {}
  ): Promise<AssignedJobsResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.status) searchParams.append("status", params.status);
    if (params.job_type) searchParams.append("job_type", params.job_type);

    const queryString = searchParams.toString();
    const url = `/worker/assigned-jobs${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<AssignedJobsResponse>(url);
    return response.data;
  },

  // Get worker's current active job
  getCurrentJob: async (): Promise<CurrentJobResponse> => {
    const response = await api.get<CurrentJobResponse>("/worker/current-job");
    return response.data;
  },

  // Get worker's job history
  getJobHistory: async (
    params: GetJobHistoryParams = {}
  ): Promise<JobHistoryResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.job_type) searchParams.append("job_type", params.job_type);
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);

    const queryString = searchParams.toString();
    const url = `/worker/job-history${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<JobHistoryResponse>(url);
    return response.data;
  },
};

// Legacy exports for backward compatibility
export const getWorkers = workersApi.getWorkers;
export const getWorker = workersApi.getWorker;
export const createWorker = workersApi.createWorker;
export const updateWorker = workersApi.updateWorker;
export const deleteWorker = workersApi.deleteWorker;
