import axiosInstance from "../../lib/axiosInstance";
import type { Pagination } from "../../types/pagination";
import type { Membership } from "./membership";

const endpoint = "membership";

export interface MembershipListResult {
  data: Membership[];
  pagination: Pagination;
}

export const membershipApi = {
  list: async (page?: number, searchTerm = "", status?: string) => {
    const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
    const params: any = { page, limit: 5, status };

    if (searchTerm.trim()) params.q = searchTerm.trim();

    const { data } = await axiosInstance.get(getEndpoint, { params });
    return data as MembershipListResult;
  },

  create: async (data: Membership) => {
    const response = await axiosInstance.post(`${endpoint}`, data);
    return response.data;
  },

  fetchOne: async (id: number) => {
    const response = await axiosInstance.get(`${endpoint}/${id}`);
    return response.data.data as Membership;
  },

  update: async (id: number, data: Membership) => {
    const response = await axiosInstance.put(`${endpoint}/${id}`, data);
    return response.data;
  },

  toggle: async (id: number, status: string) => {
    const response = await axiosInstance.put(`${endpoint}/toggle/${id}`, { status });
    return response.data;
  },

  filter: async (
    page = 1,
    filters: {
      status?: "true" | "false";
      role?: 'all' | 'admin' | 'collaborator' | 'enumerator';
      datePreset?: string;
    }
  ) => {
    const params: any = { page, limit: 5 };
    if (filters.status) params.status = filters.status;
    if (filters.role) params.role = filters.role;
    if (filters.datePreset) params.datePreset = filters.datePreset;

    const response = await axiosInstance.get("/membership/filter", { params });
    return response.data as MembershipListResult;
  },

  checkEmail: async (email: string) => {
    const response = await axiosInstance.get(`${endpoint}/check-email`, {
      params: { email },
    });
    return response.data;
  },
};