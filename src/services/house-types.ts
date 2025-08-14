import api from "@/lib/axios";

export interface HouseType {
  _id: string;
  house_type: string;
  house_title: string;
  rooms: number;
  toilets: number;
  living_rooms: number;
  monthly_price: string;
  onetime_price: string;
  isDuplex: boolean;
}

export interface HouseTypesResponse {
  data: HouseType[];
}

export interface GetHouseTypesParams {
  isDuplex?: boolean;
}

export interface CreateHouseType {
  house_type: string;
  house_title: string;
  rooms: number;
  toilets: number;
  living_rooms: number;
  monthly_price: string;
  onetime_price: string;
  isDuplex: boolean;
}

export interface UpdateHouseType {
  house_type?: string;
  house_title?: string;
  rooms?: number;
  toilets?: number;
  living_rooms?: number;
  monthly_price?: string;
  onetime_price?: string;
  isDuplex?: boolean;
}



export const houseTypesApi = {
  // Get all house types
  getHouseTypes: async (
    params: GetHouseTypesParams = {}
  ): Promise<HouseTypesResponse> => {
    const searchParams = new URLSearchParams();

    if (params.isDuplex !== undefined) {
      searchParams.append("isDuplex", params.isDuplex.toString());
    }

    const queryString = searchParams.toString();
    const url = `/house_type${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<HouseTypesResponse>(url);
    return response.data;
  },

  // Create a new house type
  createHouseType: async (
    data: CreateHouseType
  ): Promise<{ data: HouseType }> => {
    const response = await api.post<{ data: HouseType }>("/house_type/create", data);
    return response.data;
  },

  // Update an existing house type
  updateHouseType: async (
    houseTypeId: string,
    data: UpdateHouseType
  ): Promise<{ data: HouseType }> => {
    const response = await api.put<{ data: HouseType }>(`/house_type/${houseTypeId}`, data);
    return response.data;
  },

  // Delete a house type
  deleteHouseType: async (
    houseTypeId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/house_type/${houseTypeId}`
    );
    return response.data;
  },
};
