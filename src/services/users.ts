import api from "@/lib/axios";

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  sex: string;
  isVerified: boolean;
  role: string;
}

export interface UsersResponse {
  message: string;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  isVerified?: boolean;
}

// Users API functions
export const usersApi = {
  getUsers: async (params: GetUsersParams = {}): Promise<UsersResponse['data']> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.isVerified !== undefined) searchParams.append('isVerified', params.isVerified.toString());
    
    const response = await api.get<UsersResponse>(`/admin/users?${searchParams.toString()}`);
    
    if (response.data.data) {
      return response.data.data;
    }
    
    throw new Error("Invalid response format");
  },
};