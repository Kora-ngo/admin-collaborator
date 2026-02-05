// src/utils/exportUtil.ts

import axiosInstance from "./axiosInstance";

export const exportBeneficiariesToExcel = async (period: string): Promise<void> => {
    try {
        const response = await axiosInstance.get(`/export/beneficiaries`, {
            params: { period },
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Beneficiaries_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return Promise.resolve();
    } catch (error: any) {
        console.error('Export error:', error);
        throw error;
    }
};

export const exportDeliveriesToExcel = async (period: string): Promise<void> => {
    try {
        const response = await axiosInstance.get(`/export/deliveries`, {
            params: { period },
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Deliveries_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return Promise.resolve();
    } catch (error: any) {
        console.error('Export error:', error);
        throw error;
    }
};