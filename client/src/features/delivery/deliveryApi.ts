import axiosInstance from "../../lib/axiosInstance";
import type { Pagination } from "../../types/pagination";
import type { Delivery } from "./delivery";

const endpoint = "deliveries";

export interface DeliveryListResult {
  data: Delivery[];
  pagination: Pagination;
}

export const deliveryApi = {
  list: async (page = 1, searchTerm = "") => {
    const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
    const params: any = { page, limit: 10 };

    if (searchTerm.trim()) params.q = searchTerm.trim();

    const { data } = await axiosInstance.get(getEndpoint, { params });
    return data as DeliveryListResult;
  },

  fetchOne: async (id: number) => {
    const response = await axiosInstance.get(`${endpoint}/${id}`);
    return response.data.data as Delivery;
  },

  filter: async (page = 1, filters: any) => {
    const params: any = { page, limit: 10 };
    if (filters.reviewStatus) params.reviewStatus = filters.reviewStatus;
    if (filters.projectId) params.projectId = filters.projectId;
    if (filters.datePreset) params.datePreset = filters.datePreset;

    const response = await axiosInstance.get(`${endpoint}/filter`, { params });
    return response.data as DeliveryListResult;
  },

  review: async (id: number, action: 'approve' | 'reject', note?: string) => {
    const response = await axiosInstance.put(`${endpoint}/review/${id}`, {
      action,
      review_note: note
    });
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await axiosInstance.put(`${endpoint}/${id}`, { status });
    return response.data;
  },
};