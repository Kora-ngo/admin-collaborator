import axiosInstance from "../../lib/axiosInstance";
import type { Pagination } from "../../types/pagination";
import type { Project } from "./project";

const endpoint = "projects";

export interface ProjectListResult {
  data: Project[];
  pagination: Pagination;
}

export const projectApi = {
  list: async (page = 1, searchTerm = "") => {
    const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
    const params: any = { page, limit: 5 };

    if (searchTerm.trim()) params.q = searchTerm.trim();

    const { data } = await axiosInstance.get(getEndpoint, { params });
    return data as ProjectListResult;
  },

  fetchOne: async (id: number) => {
    const response = await axiosInstance.get(`${endpoint}/${id}`);
    return response.data.data as Project;
  },

  create: async (payload: any) => {
    const response = await axiosInstance.post(`${endpoint}`, payload);
    return response.data;
  },

  update: async (id: number, payload: any) => {
    const response = await axiosInstance.put(`/${endpoint}/${id}`, payload);
    return response.data;
  },

  toggle: async (id: number, status: string) => {
    const response = await axiosInstance.put(`${endpoint}/toggle/${id}`, { status });
    return response.data;
  },

  filter: async (page = 1, filters: { status?: string; datePreset?: string }) => {
    const params: any = { page, limit: 5 };
    if (filters.status) params.status = filters.status;
    if (filters.datePreset) params.datePreset = filters.datePreset;

    const response = await axiosInstance.get(`${endpoint}/filter`, { params });
    return response.data as ProjectListResult;
  },
};