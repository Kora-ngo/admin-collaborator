import { useEffect } from "react";
import { useState } from "react";
import { useAnalyticsStore } from "../store/analyticsStore";
import { useToastStore } from "../../../store/toastStore";

export const useAnalytics = () => {
    const { data, loading, filterOptions, loadingFilters, fetchAnalytics, fetchFilterOptions } = useAnalyticsStore();
    const showToast = useToastStore((state) => state.showToast);

    const [project, setProject] = useState("all");
    const [period, setPeriod] = useState("last_30_days");
    const [region, setRegion] = useState("all");

    // Independent of the main analytics call — dropdowns aren't blocked
    // waiting on the heavier payload.
    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);

    useEffect(() => {
        const load = async () => {
            const result = await fetchAnalytics({ project, period, region });
            if (result.type !== "success") {
                showToast(result);
            }
        };

        load();
    }, [project, period, region, fetchAnalytics]);

    return {
        data,
        loading,

        filterOptions,
        loadingFilters,

        project,
        setProject,
        period,
        setPeriod,
        region,
        setRegion,
    };
};