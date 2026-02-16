import type { ToastMessage } from "../types/toastMessage";

let lastNetworkToastTime = 0;
const NETWORK_TOAST_COOLDOWN_MS = 5000;


export const handleApiError = (err: any): ToastMessage => {

    let toast: ToastMessage = {
        type: 'error',
        message: 'An unexpected error occurred.',
        show: true,
    };



    // Subscription expired / inactive (403 from backend)
    if (err.response?.status === 403) {
        const backend = err.response.data;

        // Check for subscription-related error
        if (
        backend?.message?.toLowerCase().includes('subscription') ||
        backend?.subscriptionStatus === false ||
        backend?.subscriptionStatus === 'expired' ||
        backend?.subscriptionStatus === 'suspended'
        ) {
        // Show warning toast
        toast = {
            type: 'warning',
            title: 'Subscription Inactive',
            message: 'no_active_subscription',
            show: true,
            autoClose: 8000,
        };

        // Reload window after a short delay so user sees the toast
        // setTimeout(() => {
        //     window.location.reload();
        // }, 3000); 

        return toast;
        }
    }


    if (!err.response && err.request) {
        // This is the classic "no internet" or "server unreachable" case
        const now = Date.now();
        if (now - lastNetworkToastTime < NETWORK_TOAST_COOLDOWN_MS) {
            // Silent during cooldown
            return { type: 'no_network', message: '', show: false };
        }

        lastNetworkToastTime = now;

        return {
            type: 'no_network',
            title: 'No Internet Connection',
            message: 'no_internet',
            show: true,
            autoClose: false,          // don't auto-dismiss
        };
    }

    // 2. Timeout (client-side or server 504)
    if (err.code === 'ECONNABORTED' || err.response?.status === 504) {

        return {
            type: 'warning',
            title: 'Request Timed Out',
            message: 'The operation took too long. Please try again.',
            show: true,
            autoClose: 8000,
        };
    }


  // 3. Backend known responses 
    if (err.response?.data) {
        const backend = err.response.data;

        // Prefer backend-provided type/message if available
        toast.type = backend.type || 'error';
        toast.message = backend.message || backend.error || toast.message;
        toast.title = backend.title; // optional

        // Special backend cases
        if (err.response.status === 503) {
            toast.type = 'no_network';
            toast.message = 'no_internet';
        }

        if (err.response.status === 401 || err.response.status === 403) {
            toast.type = 'error';
            toast.message = backend.message || 'Session expired or unauthorized. Please log in again.';
            // Optional: trigger logout
        }
    }

    // Fallback message
    if (!toast.message) {
        toast.message = err.message || 'Something went wrong.';
    }

    console.error('[API Error]', {
        status: err.response?.status,
        code: err.code,
        message: toast.message,
        fullError: err,
    });

    return toast;
};