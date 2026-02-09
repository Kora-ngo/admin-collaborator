// hooks/useSessionGuard.ts

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { sessionManager } from './sessionManager';
import { useToastStore } from '../../store/toastStore';

/**
 * Hook to enforce single-tab session
 * Use this in your main App.tsx or protected routes
 */
export const useSessionGuard = () => {
    // const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const showToast = useToastStore(state => state.showToast);

    useEffect(() => {
        // Only run if user is authenticated
        if (!user) return;

        // Initialize session with logout callback
        sessionManager.initSession(() => {
            // This runs when session expires (another tab took over)
            handleSessionExpired();
        });

        // Cleanup on unmount
        return () => {
            sessionManager.clearSession();
        };
    }, [user]);

    const handleSessionExpired = () => {
        // Show toast notification
        showToast({
            type: 'warning',
            message: 'session_expired'
        });

        // Logout user
        logout();

        // Redirect to login
        // navigate('/login', { replace: true });
    };
};