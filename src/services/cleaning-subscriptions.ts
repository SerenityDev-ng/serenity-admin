import api from "@/lib/axios";
import { AxiosError } from "axios";

export interface CleaningSubscription {
  id: string;
  customer_id: string;
  subscription_type: string;
  frequency: string;
  status: "active" | "paused" | "cancelled" | "completed";
  start_date: string;
  end_date?: string;
  next_service_date: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  address: object;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionOrder {
  id: string;
  subscription_id: string;
  worker_id?: string;
  order_date: string;
  service_date: string;
  status:
    | "PENDING"
    | "PAID"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CleaningSubscriptionsResponse {
  message: string;
  data: {
    subscriptions: CleaningSubscription[];
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

export interface SubscriptionDetailsResponse {
  message: string;
  data: {
    subscription: CleaningSubscription;
    orders: SubscriptionOrder[];
  };
}

export interface SubscriptionOrdersResponse {
  message: string;
  data: {
    orders: SubscriptionOrder[];
  };
}

export interface GetCleaningSubscriptionsParams {
  status?: "active" | "paused" | "cancelled" | "completed";
  page?: number;
  limit?: number;
}

export interface GetSubscriptionOrdersParams {
  subscriptionId: string;
  status?:
    | "PENDING"
    | "PAID"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
}

export interface AssignWorkerRequest {
  worker_id: string;
  order_ids: string[];
}

export interface UpdateSubscriptionStatusRequest {
  status: "active" | "paused" | "cancelled" | "completed";
}

export interface CleaningSubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  paused_subscriptions: number;
  cancelled_subscriptions: number;
  completed_subscriptions: number;
  total_revenue: number;
  pending_revenue: number;
  monthly_growth: number;
}

// Get all cleaning subscriptions
export const getCleaningSubscriptions = async (
  params: GetCleaningSubscriptionsParams = {}
): Promise<CleaningSubscriptionsResponse> => {
  const response = await api.get("/admin/cleaning/subscriptions", {
    params,
  });
  return response.data;
};

// Get subscription details with orders
export const getSubscriptionDetails = async (
  subscriptionId: string
): Promise<SubscriptionDetailsResponse> => {
  const response = await api.get(
    `/admin/cleaning/subscriptions/${subscriptionId}`
  );
  return response.data;
};

// Get all orders for a subscription
export const getSubscriptionOrders = async (
  params: GetSubscriptionOrdersParams
): Promise<SubscriptionOrdersResponse> => {
  const { subscriptionId, ...queryParams } = params;
  const response = await api.get(
    `/admin/cleaning/subscriptions/${subscriptionId}/orders`,
    { params: queryParams }
  );
  return response.data;
};

// Assign worker to subscription orders
export const assignWorkerToSubscription = async (
  subscriptionId: string,
  data: AssignWorkerRequest
): Promise<{ message: string }> => {
  const response = await api.post(
    `/admin/cleaning/subscriptions/${subscriptionId}/assign-worker`,
    data
  );
  return response.data;
};

// Update subscription status
export const updateSubscriptionStatus = async (
  subscriptionId: string,
  data: UpdateSubscriptionStatusRequest
): Promise<{ message: string }> => {
  const response = await api.patch(
    `/admin/cleaning/subscriptions/${subscriptionId}/status`,
    data
  );
  return response.data;
};

// Create new subscription
export const createCleaningSubscription = async (
  subscription: Partial<CleaningSubscription>
): Promise<{ message: string; data: CleaningSubscription }> => {
  const response = await api.post(
    "/admin/cleaning/subscriptions",
    subscription
  );
  return response.data;
};

// Update subscription
export const updateCleaningSubscription = async (
  id: string,
  subscription: Partial<CleaningSubscription>
): Promise<{ message: string; data: CleaningSubscription }> => {
  const response = await api.put(
    `/admin/cleaning/subscriptions/${id}`,
    subscription
  );
  return response.data;
};

// Delete subscription
export const deleteCleaningSubscription = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/cleaning/subscriptions/${id}`);
  return response.data;
};

// Get cleaning subscription statistics
export const getCleaningSubscriptionStats = async (): Promise<{
  message: string;
  data: CleaningSubscriptionStats;
}> => {
  const response = await api.get("/admin/cleaning/subscriptions/stats");
  return response.data;
};
