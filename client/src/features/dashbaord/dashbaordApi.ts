import axiosInstance from "../../lib/axiosInstance";

export const dashboardApi = {
    // Admin — consolidated. Replaces the old three separate calls

    getAdminOverview: async () => {
        const { data } = await axiosInstance.get('/dashboard/admin');
        console.log("Data --> ", data);
        return data;
    },

    // Collaborator endpoints — unchanged
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