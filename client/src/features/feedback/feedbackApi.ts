import axiosInstance from "../../lib/axiosInstance";

export const feedbackApi = {
    send: async (message: string, email?: string) => {
        const response = await axiosInstance.post('/feedback', {
            message,
            email: email || undefined
        });
        return response.data;
    },
};