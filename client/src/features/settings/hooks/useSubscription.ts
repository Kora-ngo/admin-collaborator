import { useEffect } from 'react';
import { useSubscriptionStore } from '../store/subscriptionStore';

export const useSubscription = () => {
    const { 
        history, 
        currentSubscription, 
        loading, 
        pagination,
        getHistory, 
        getCurrentSubscription 
    } = useSubscriptionStore();

    // Load history on mount
    useEffect(() => {
        getHistory();
    }, []);

    // Load current subscription on mount
    useEffect(() => {
        getCurrentSubscription();
    }, []);

    const loadPage = async (page: number) => {
        await getHistory(page);
    };

    const refresh = async () => {
        await getHistory(pagination?.page || 1);
        await getCurrentSubscription();
    };

    return {
        history,
        currentSubscription,
        loading,
        pagination,
        loadPage,
        refresh
    };
};