// src/features/family/hooks/useBeneficiary.ts

import { useCallback, useEffect, useState } from "react";
import { useBeneficiaryStore } from "../store/beneficiaryStore";
import { useToastStore } from "../../../store/toastStore";

export const useBeneficiary = () => {
    const { getData, filterData, fetchOneData, reviewBeneficiary, deleteData } = useBeneficiaryStore();
    const showToast = useToastStore((state) => state.showToast);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterMode, setFilterMode] = useState(false);
    const [filters, setFilters] = useState({
        reviewStatus: "",
        projectId: 0,
        datePreset: "all"
    });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            getData(1, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, getData]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const toggleFilter = () => {
        setFilterMode(prev => !prev);
        if (!filterMode) {
            setSearchTerm("");
        }
    };

    // Apply filters
    const applyFilters = useCallback(() => {
        if (!filterMode) {
            getData(1, searchTerm);
            return;
        }

        const activeFilters: any = {};
        if (filters.reviewStatus) activeFilters.reviewStatus = filters.reviewStatus;
        if (filters.projectId > 0) activeFilters.projectId = filters.projectId;
        if (filters.datePreset !== "all") activeFilters.datePreset = filters.datePreset;

        filterData(1, activeFilters);
    }, [filterMode, filters, searchTerm, getData, filterData]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleReviewStatusChange = (value: string) => setFilters(prev => ({ ...prev, reviewStatus: value }));
    const handleProjectChange = (value: number) => setFilters(prev => ({ ...prev, projectId: value }));
    const handleDatePresetChange = (value: string) => setFilters(prev => ({ ...prev, datePreset: value }));

    const refreshCurrentPage = (page: number) => {
        filterMode ? filterData(page, filters) : getData(page, searchTerm);
    };

    const handleView = async (id: number) => {
        return await fetchOneData(id);
    };

    const handleReview = async (id: number, action: 'approve' | 'reject', note?: string): Promise<boolean> => {
        const result = await reviewBeneficiary(id, action, note);
        showToast(result);
        return result.type === "success";
    };

    const handleDelete = async (id: number, status: string): Promise<boolean> => {
        if (!id || id <= 0) {
            return false;
        }

        const result = await deleteData(id, status);


        showToast(result);
        await getData();
        return result.type === "success";
    };

    return {
        searchTerm,
        handleSearch,
        filterMode,
        toggleFilter,
        filters,
        handleReviewStatusChange,
        handleProjectChange,
        handleDatePresetChange,
        refreshCurrentPage,
        handleView,
        handleReview,
        handleDelete
    };
};