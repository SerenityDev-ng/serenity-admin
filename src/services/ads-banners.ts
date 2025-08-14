import api from "@/lib/axios";

export interface AdsBanner {
  _id: string;
  image: string;
  link: string;
  is_active: boolean;
}

export interface AdsBannersResponse {
  data: AdsBanner[];
}

export interface GetAdsBannersParams {
  is_active?: boolean;
}

export interface CreateAdsBanner {
  image: string;
  link: string;
  is_active: boolean;
}

export interface UpdateAdsBanner {
  image?: string;
  link?: string;
  is_active?: boolean;
}



export const adsBannersApi = {
  // Get all ads banners
  getAdsBanners: async (
    params: GetAdsBannersParams = {}
  ): Promise<AdsBannersResponse> => {
    const searchParams = new URLSearchParams();

    if (params.is_active !== undefined) {
      searchParams.append("is_active", params.is_active.toString());
    }

    const queryString = searchParams.toString();
    const url = `/ads_banner${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<AdsBannersResponse>(url);
    return response.data;
  },

  // Create a new ads banner
  createAdsBanner: async (
    data: CreateAdsBanner
  ): Promise<{ data: AdsBanner }> => {
    const response = await api.post<{ data: AdsBanner }>("/ads_banner/create", data);
    return response.data;
  },

  // Update an existing ads banner
  updateAdsBanner: async (
    bannerId: string,
    data: UpdateAdsBanner
  ): Promise<{ data: AdsBanner }> => {
    const response = await api.put<{ data: AdsBanner }>(`/ads_banner/${bannerId}`, data);
    return response.data;
  },

  // Delete an ads banner
  deleteAdsBanner: async (
    bannerId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/ads_banner/${bannerId}`
    );
    return response.data;
  },
};
