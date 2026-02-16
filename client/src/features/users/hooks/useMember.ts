import { useCallback, useEffect, useState } from "react";
import { useToastStore } from "../../../store/toastStore";
import type { Membership } from "../../../types/membership";
import { useMembershipStore } from "../store/membershipStore"
import type { ToastMessage } from "../../../types/toastMessage";
import { validateMembership } from "../utils/validate";
import { useAuthStore } from "../../auth/store/authStore";

export const useMembership = () => {

    const {getData, filterData, updateData, createData, fetchOneData, toggleData} = useMembershipStore();
    const showToast = useToastStore((state) => state.showToast);
    const {organisation} = useAuthStore();

    const [form, setForm] = useState<Partial<Membership & {
        email?: string;
        name?: string;
        phone?: string;
        password?: string;
    }>>({
        organization_id: 1,
        role: "",
    }); 

    const [errors, setErrors] = useState({
        organization_id: false,
        name: false, 
        role: false,
        email: false,
        password: false
    });


    // Search state
    const [searchTerm, setSearchTerm] = useState("");


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


    // Filter state
    const [filterMode, setFilterMode] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        role: "",
        datePreset: "all"
    });


    const toggleFilter = () => {
        setFilterMode(prev => !prev);
        if (!filterMode) {
            setSearchTerm("");
        }
    };



    const applyFilters = useCallback(() => {
        if (!filterMode) {
            getData(1, searchTerm);
            return;
        }

        const activeFilters: any = {};
        if (filters.status) activeFilters.status = filters.status;
        if (filters.role) activeFilters.role = filters.role;
        if (filters.datePreset !== "all") activeFilters.datePreset = filters.datePreset;

        filterData(1, activeFilters);
    }, [filterMode, filters, searchTerm, getData, filterData]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleStatusChange = (value: string) => setFilters(prev => ({ ...prev, status: value }));
    const handleRoleChange = (value: string) => setFilters(prev => ({ ...prev, role: value }));
    const handleDatePresetChange = (value: string) => {
        setFilters(prev => ({ ...prev, datePreset: value }));
    };



    const handleClearForm = () => {
        setForm({
            organization_id: organisation?.id,
            role: "",
            email: "",
            name: "",
            phone: "",
            password: "",
        });
        setErrors({
            name: false,
            organization_id: false,
            role: false,
            email: false,
            password: false
        });
    };


    const refreshCurrentPage = (page: number) => {
        filterMode ? filterData(page, filters) : getData(page, searchTerm);
    };


    const handleSubmit = async (id?: number): Promise<boolean> => {
        const { hasErrors, formErrors, data } = validateMembership(form, !!id);

        setErrors(formErrors);

        if (hasErrors) {
            return false;
        }

        try {
            let result: ToastMessage;

            if (id) {
                result = await updateData(id, data);
            } else {
                result = await createData(data);
            }

            showToast(result);

            if (result.type === "success") {
                await getData();
                handleClearForm();
                return true;
            }

            return false;
        } catch (error) {
            console.error("Submit error:", error);
            return false;
        }
    };


    const handleView = async (id: number): Promise<any> => {
        const response: Membership | any = await fetchOneData(id);

        setForm({
            user_id: response.user_id,
            organization_id: response.organization_id,
            role: response.role,
        });

        return response;
    };

    const handleToggle = async (id: number, status: string): Promise<boolean> => {
        if (!id || id <= 0) {
            return false;
        }

        const result = await toggleData(id, status);


        showToast(result);
        await getData();
        return result.type === "success";
    };


    return {
        form,
        setForm,
        errors,
        searchTerm,
        handleSearch,
        refreshCurrentPage,

        filterMode,
        toggleFilter,
        filters,
        handleStatusChange,
        handleRoleChange,
        handleDatePresetChange,

        handleSubmit,
        handleView,
        handleToggle,
        handleClearForm,
    };

}