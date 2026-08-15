import { useCallback, useEffect, useState } from "react";
import { useReportStore } from "../store/reportStore";
import { useToastStore } from "../../../store/toastStore";
import type { Report } from "../types/report";

export const useReport = () => {
    const { getData, filterData, fetchOneData, removeData, downloadReport, downloadingId } = useReportStore();
    const showToast = useToastStore((state) => state.showToast);

    const [filterMode, setFilterMode] = useState(false);
    const [filters, setFilters] = useState({
        type: "",
        status: "",
        project_id: "",
    });

    const toggleFilter = () => setFilterMode((prev) => !prev);

    const applyFilters = useCallback(() => {
        if (!filterMode) {
            getData(1);
            return;
        }

        const activeFilters: any = {};
        if (filters.type) activeFilters.type = filters.type;
        if (filters.status) activeFilters.status = filters.status;
        if (filters.project_id) activeFilters.project_id = filters.project_id;

        filterData(1, activeFilters);
    }, [filterMode, filters, getData, filterData]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleTypeChange = (value: string) => setFilters((prev) => ({ ...prev, type: value }));
    const handleStatusChange = (value: string) => setFilters((prev) => ({ ...prev, status: value }));
    const handleProjectChange = (value: string) => setFilters((prev) => ({ ...prev, project_id: value }));

    const refreshCurrentPage = (page: number) => {
        filterMode ? filterData(page, filters) : getData(page);
    };

    const handleDelete = async (id: number, page: number): Promise<boolean> => {
        const result = await removeData(id);
        showToast(result);

        if (result.type === "success") {
            await refreshCurrentPage(page);
            return true;
        }

        return false;
    };

    const handleDownload = (report: Report) => {
        downloadReport(report);
    };

    // Fetch a single report for the view modal. fetchOneData resolves to a
    // ToastMessage<Report> either way — success carries `data`, failure
    // (network, not found, etc.) doesn't, so that's the discriminator.
    const handleView = async (id: number): Promise<Report | null> => {
        const result = await fetchOneData(id);

        if (result.type !== "success") {
            showToast(result);
            return null;
        }

        return result.data!;
    };

    return {
        filterMode,
        toggleFilter,
        filters,
        handleTypeChange,
        handleStatusChange,
        handleProjectChange,
        refreshCurrentPage,
        handleDelete,
        handleDownload,
        downloadingId,
        handleView,
    };
};