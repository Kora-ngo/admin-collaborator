import axiosInstance from "../../lib/axiosInstance";

const endpoint = "/auth";

export const authApi = {
    registerAdmin: async (users: any, organisation: any) => {
        const response = await axiosInstance.post(`${endpoint}/register-admin`, {
            users,
            organisation
        });
        return response;
    },

    login: async (email: string, password: any) => {
        const response = await axiosInstance.post(`${endpoint}/login`, {
            email,
            password
        });
        return response;
    },

    resetPassword: async (email: string, newPassword: string, confirmPassword: string) => {
        const response = await axiosInstance.put('/auth/forgot-password', {
            email,
            newPassword,
            confirmPassword
        });
        return response;
    },

    getCurrentUser: async () => {
        const response = await axiosInstance.get(`${endpoint}/me`);
        return response;
    },

    updateProfile: async (data: any) => {
        const response = await axiosInstance.put(`${endpoint}/profile`, data);
        return response;
    },

    updateOrganisation: async (data: any) => {
        const response = await axiosInstance.put(`${endpoint}/organisation`, data);
        return response;
    },
};