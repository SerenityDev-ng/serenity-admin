import api from "@/lib/axios";
import { AxiosError } from "axios";

export interface TimeSlot {
  start_time: string;
  end_time: string;
  _id: string;
}

export interface WeeklySchedule {
  day: string;
  time_slots: TimeSlot[];
  _id: string;
}

export interface SubscriptionDetails {
  start_date: string;
  end_date: string;
  weekly_schedule: WeeklySchedule[];
}

export interface CleaningAddress {
  state: string;
  address: string;
  longitude: string;
  latitude: string;
}

export interface User {
  _id: string;
  email: string;
}

export interface CleaningSubscription {
  subscription: SubscriptionDetails;
  cleaning_address: CleaningAddress;
  _id: string;
  user: User;
  services: any[]; // You might want to define a more specific interface for services
  cleaningHouse: string;
  buildingType: string;
  basePrice: number;
  totalPrice: number;
  multiplier: number;
  frequency: string;
  payment_method: string;
  booking_status: "PENDING" | "PAID" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  is_gift: boolean;
  gift_sender: string | null;
  notes: string;
  is_subscription: boolean;
  subscription_status: "active" | "paused" | "cancelled" | "completed";
  generated_orders: string[];
  total_orders_generated: number;
  orders_completed: number;
  orders_pending: number;
  orders_cancelled: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  data: CleaningSubscription;
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
