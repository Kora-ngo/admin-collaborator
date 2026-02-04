import { useCallback, useEffect, useState } from "react";
import { useAuditLogStore } from "../store/auditLogStore";

export const useAuditLog = () => {
    const { getData, filterData } = useAuditLogStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterMode, setFilterMode] = useState(false);
    const [filters, setFilters] = useState({
        entityType: "",
        actorRole: "",
        platform: "",
        datePreset: "all"
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!filterMode) {
                getData(1, searchTerm);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filterMode, getData]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const toggleFilter = () => {
        setFilterMode(prev => !prev);
        if (!filterMode) setSearchTerm("");
    };

    const applyFilters = useCallback(() => {
        if (!filterMode) {
            getData(1, searchTerm);
            return;
        }

        const activeFilters: any = {};
        if (filters.entityType) activeFilters.entityType = filters.entityType;
        if (filters.actorRole) activeFilters.actorRole = filters.actorRole;
        if (filters.platform) activeFilters.platform = filters.platform;
        if (filters.datePreset !== "all") activeFilters.datePreset = filters.datePreset;

        filterData(1, activeFilters);
    }, [filterMode, filters, searchTerm, getData, filterData]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleEntityTypeChange = (value: string) => setFilters(prev => ({ ...prev, entityType: value }));
    const handleActorRoleChange = (value: string) => setFilters(prev => ({ ...prev, actorRole: value }));
    const handlePlatformChange = (value: string) => setFilters(prev => ({ ...prev, platform: value }));
    const handleDatePresetChange = (value: string) => setFilters(prev => ({ ...prev, datePreset: value }));

    const refreshCurrentPage = (page: number) => {
        filterMode ? filterData(page, filters) : getData(page, searchTerm);
    };

    return {
        searchTerm,
        handleSearch,
        filterMode,
        toggleFilter,
        filters,
        handleEntityTypeChange,
        handleActorRoleChange,
        handlePlatformChange,
        handleDatePresetChange,
        refreshCurrentPage
    };
};