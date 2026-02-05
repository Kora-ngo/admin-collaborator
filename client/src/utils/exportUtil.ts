import axiosInstance from "./axiosInstance";

export const exportBeneficiariesToCSV = async (period: string): Promise<void> => {
    try {
        const response = await axiosInstance.get(`/export/beneficiaries`, {
            params: { period },
            responseType: 'blob' // Important for file download
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `beneficiaries_${period}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return Promise.resolve();
    } catch (error: any) {
        console.error('Export error:', error);
        throw error;
    }
};

export const exportDeliveriesToCSV = async (period: string): Promise<void> => {
    try {
        const response = await axiosInstance.get(`/export/deliveries`, {
            params: { period },
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `deliveries_${period}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return Promise.resolve();
    } catch (error: any) {
        console.error('Export error:', error);
        throw error;
    }
};