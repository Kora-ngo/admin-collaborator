import type { ToastMessage } from "../types/toastMessage";

export const handleApiError = (err: any): ToastMessage => {
    let message = "An unexpected error occurred.";


    if(err.response?.data) {
        message = 
        err.response.data.message ||
        err.response.data.error ||
        (typeof err.response.data === "string" ? err.response.data : message);
    }else if(err.request) {
        message = "Network error. Please check your connection.";
    }else {
        message = err.message || message;
    }

    console.log("Errror API handle --> ", err.response?.data);

    return {
        type: err.response?.data.type || "error",
        message,
        show: true
    };
};