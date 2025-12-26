import type { ToastMessage } from "../types/toastMessage";
import { getMessage } from "./getMessage";

export const handleApiError = (err: any): ToastMessage => {
    let message = "An unexpected error occurred.";

    if(err.response?.data) {
        message = 
        getMessage(err.response.data.message) ||
        err.response.data.error ||
        (typeof err.response.data === "string" ? err.response.data : message);
    }else if(err.request) {
        message = "Network error. Please check your connection.";
    }else {
        message = err.message || message;
    }

    return {
        type: "error",
        message,
        show: true
    };
};