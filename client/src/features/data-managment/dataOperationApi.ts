import axiosInstance from "../../lib/axiosInstance";
import type { ToastMessage } from "../../types/toastMessage";
import type { Dataset, ValidationResult } from "./types";


const endpoint = "data-operation";

export const dataOperationsApi = {
    validate: async (dataset: Dataset, file: File): Promise<ToastMessage<ValidationResult>> => {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axiosInstance.post(
            `/${endpoint}/${dataset.toLowerCase()}/validate`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        return data as ToastMessage<ValidationResult>;
    },
};