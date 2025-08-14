import api from "@/lib/axios";

export interface WithdrawalRequest {
  id: string;
  worker_id: string;
  worker_name?: string;
  worker_email?: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "processed";
  request_date: string;
  processed_date?: string;
  processed_by?: string;
  bank_details: {
    account_number: string;
    bank_name: string;
    account_holder_name: string;
    routing_number?: string;
  };
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequestsResponse {
  data: {
    withdrawal_requests: WithdrawalRequest[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
  success: boolean;
}

export interface GetWithdrawalRequestsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected" | "processed";
  worker_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "request_date" | "amount" | "status";
  sort_order?: "asc" | "desc";
}

export interface ProcessWithdrawalRequest {
  status: "approved" | "rejected" | "processed";
  notes?: string;
  rejection_reason?: string;
}

export interface CreateWithdrawalRequest {
  worker_id: string;
  amount: number;
  bank_details: {
    account_number: string;
    bank_name: string;
    account_holder_name: string;
    routing_number?: string;
  };
  notes?: string;
}

export const withdrawalRequestsApi = {
  // Get all withdrawal requests with filtering and pagination
  getWithdrawalRequests: async (
    params: GetWithdrawalRequestsParams = {}
  ): Promise<WithdrawalRequestsResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.status) searchParams.append("status", params.status);
    if (params.worker_id) searchParams.append("worker_id", params.worker_id);
    if (params.date_from) searchParams.append("date_from", params.date_from);
    if (params.date_to) searchParams.append("date_to", params.date_to);
    if (params.sort_by) searchParams.append("sort_by", params.sort_by);
    if (params.sort_order) searchParams.append("sort_order", params.sort_order);

    const queryString = searchParams.toString();
    const url = `/admin/withdrawal-requests${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await api.get<WithdrawalRequestsResponse>(url);
    return response.data;
  },

  // Get a specific withdrawal request
  getWithdrawalRequest: async (
    requestId: string
  ): Promise<{
    data: WithdrawalRequest;
    message: string;
    success: boolean;
  }> => {
    const response = await api.get<{
      data: WithdrawalRequest;
      message: string;
      success: boolean;
    }>(`/admin/withdrawal-requests/${requestId}`);
    return response.data;
  },

  // Create a new withdrawal request
  createWithdrawalRequest: async (
    data: CreateWithdrawalRequest
  ): Promise<{
    data: WithdrawalRequest;
    message: string;
    success: boolean;
  }> => {
    const response = await api.post<{
      data: WithdrawalRequest;
      message: string;
      success: boolean;
    }>("/admin/withdrawal-requests", data);
    return response.data;
  },

  // Process a withdrawal request (approve, reject, or mark as processed)
  processWithdrawalRequest: async (
    requestId: string,
    data: ProcessWithdrawalRequest
  ): Promise<{
    data: WithdrawalRequest;
    message: string;
    success: boolean;
  }> => {
    const response = await api.patch<{
      data: WithdrawalRequest;
      message: string;
      success: boolean;
    }>(`/admin/withdrawal-requests/${requestId}/process`, data);
    return response.data;
  },

  // Delete a withdrawal request
  deleteWithdrawalRequest: async (
    requestId: string
  ): Promise<{ message: string; success: boolean }> => {
    const response = await api.delete<{ message: string; success: boolean }>(
      `/admin/withdrawal-requests/${requestId}`
    );
    return response.data;
  },

  // Get withdrawal statistics
  getWithdrawalStats: async (): Promise<{
    data: {
      total_pending: number;
      total_approved: number;
      total_processed: number;
      total_rejected: number;
      pending_amount: number;
      processed_amount: number;
    };
    message: string;
    success: boolean;
  }> => {
    const response = await api.get<{
      data: {
        total_pending: number;
        total_approved: number;
        total_processed: number;
        total_rejected: number;
        pending_amount: number;
        processed_amount: number;
      };
      message: string;
      success: boolean;
    }>("/admin/withdrawal-requests/stats");
    return response.data;
  },
};
