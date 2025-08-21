import api from "@/lib/axios";
import { AxiosError } from "axios";

export interface Booking {
  _id: string;
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    sex: string;
    isVerified: boolean;
  };
  worker_id?: string;
  frequency: string;
  booking_status:
    | "PENDING"
    | "PAID"
    | "ASSIGNED"
    | "ONGOING"
    | "DONE"
    | "CANCELLED";
  cleaning_time: Array<{
    opening_time: string;
    closing_time: string;
    _id: string;
  }>;
  cleaning_address: {
    state: string;
    address: string;
    longitude: string;
    latitude: string;
  };
  house_type: {
    _id: string;
  };
  total_amount: string;
  payment_method: string;
  pricing_metadata: {
    isOneTime: boolean;
  };
  subscription_order: boolean;
  is_gift: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BookingsResponse {
  message: string;
  data: {
    bookings: Booking[];
    booking_type: string;
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  booking_status?:
    | "PENDING"
    | "PAID"
    | "ASSIGNED"
    | "ONGOING"
    | "DONE"
    | "CANCELLED";
  frequency?: string;
  subscription_order?: boolean;
  booking_type: "cleaning" | "laundry" | "repair";
}

export const getBookings = async (
  params: GetBookingsParams
): Promise<BookingsResponse> => {
  const response = await api.get("/admin/bookings", { params });
  return response.data;
};

export const getBooking = async (
  id: string
): Promise<{ message: string; data: Booking }> => {
  const response = await api.get(`/admin/bookings/${id}`);
  return response.data;
};

export const createBooking = async (
  booking: Partial<Booking>
): Promise<{ message: string; data: Booking }> => {
  const response = await api.post("/admin/bookings", booking);
  return response.data;
};

export const updateBooking = async (
  id: string,
  booking: Partial<Booking>
): Promise<{ message: string; data: Booking }> => {
  const response = await api.put(`/admin/bookings/${id}`, booking);
  return response.data;
};

export const deleteBooking = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/bookings/${id}`);
  return response.data;
};

// ---------------- Assign Worker to Booking (per service) ----------------
export interface AssignWorkerToBookingRequest {
  worker_id: string;
  assignment_date: string; // YYYY-MM-DD
  assignment_time: {
    start_time: string; // HH:MM
    end_time: string; // HH:MM
  };
}

export const assignWorkerToCleaningBooking = async (
  bookingId: string,
  data: AssignWorkerToBookingRequest
): Promise<{ message: string; data: Booking }> => {
  const response = await api.patch(
    `/admin/cleaning/bookings/${bookingId}/assign-worker`,
    data
  );
  return response.data;
};

export const assignWorkerToLaundryBooking = async (
  bookingId: string,
  data: AssignWorkerToBookingRequest
): Promise<{ message: string; data: Booking }> => {
  const response = await api.patch(
    `/admin/laundry/bookings/${bookingId}/assign-worker`,
    data
  );
  return response.data;
};

export const assignWorkerToRepairBooking = async (
  bookingId: string,
  data: AssignWorkerToBookingRequest
): Promise<{ message: string; data: Booking }> => {
  // Note the endpoint name per spec: "assignworker" without hyphen
  const response = await api.patch(
    `/admin/repair_service/bookings/${bookingId}/assignworker`,
    data
  );
  return response.data;
};
