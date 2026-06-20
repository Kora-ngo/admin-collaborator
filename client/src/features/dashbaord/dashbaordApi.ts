import axiosInstance from "../../lib/axiosInstance";

export const dashboardApi = {
    // Admin endpoints
    getKeyMetrics: async () => {
        const { data } = await axiosInstance.get('/dashboard/admin/key-metrics');
        return data;
    },

    getProjectProgress: async () => {
        const { data } = await axiosInstance.get('/dashboard/admin/project-progress');
        return data;
    },

    getProjectAlert: async () => {
        const { data } = await axiosInstance.get('/dashboard/admin/alerts');
        return data;
    },

    // Collaborator endpoints
    getCollaboratorMetrics: async () => {
        const { data } = await axiosInstance.get('/dashboard/collaborator/key-metrics');
        return data;
    },

    getEnumeratorActivity: async () => {
        const { data } = await axiosInstance.get('/dashboard/collaborator/enumerator-activity');
        return data;
    },

    getValidationQueue: async () => {
        const { data } = await axiosInstance.get('/dashboard/collaborator/validation-queue');
        return data;
    },
};