import { useCallback, useEffect, useState } from "react"
import type { Project, ProjectAssistance, ProjectMember } from "../../../types/project"
import type { Membership } from "../../../types/membership";
import type { Assistance } from "../../../types/assistance";
import { validateProject } from "../utils/validate";
import { useAuthStore } from "../../auth/store/authStore";
import { useToastStore } from "../../../store/toastStore";
import { useProjectStore } from "../store/projectStore";
// import 


type ProjectFormData = Partial<Project> & {
    selectedMembers: ProjectMember[];   // Array of selected members
    selectedAssistances: ProjectAssistance[]; // Array of selected assistances
    region?: string;  // UI-only field
};

export const useProject = () => {

    const {organisation} = useAuthStore();

    const { createData, getData, fetchOneData, filterData, updateData, toggleData } = useProjectStore();
    const showToast = useToastStore((state) => state.showToast);


    const [projectForm, setProjectForm] = useState<ProjectFormData>({
        organisation_id: organisation?.id,
        name: "",
        description: "",
        status: "pending",
        start_date: "",
        end_date: "",
        selectedMembers: [],
        selectedAssistances: [],
    });

    const [errors, setErrors] = useState({
        name: false,
        organisation_id: false,
        start_date: false,
        end_date: false,
        selectedMembers: false,
    });

    // Search state
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            getData(1, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [getData]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };


    // Filter state
    const [filterMode, setFilterMode] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
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
        if (filters.datePreset !== "all") activeFilters.datePreset = filters.datePreset;

        filterData(1, activeFilters);
    }, [filterMode, filters, searchTerm, getData, filterData]);


    useEffect(() => {
        applyFilters();
    }, [applyFilters]);


    const handleStatusChange = (value: string) => setFilters(prev => ({ ...prev, status: value }));
    const handleDatePresetChange = (value: string) => {
        setFilters(prev => ({ ...prev, datePreset: value }));
    };

    

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        
        // Handle date fields specially
        if (name === 'start_date' || name === 'end_date') {
            setProjectForm(prev => ({
                ...prev,
                [name]: value || undefined  // datetime-local gives empty string when cleared
            }));
        } else {
            setProjectForm(prev => ({
                ...prev,
                [name]: value || undefined
            }));
        }
    };


    const updateSelectedMembers = (members: any) => {
        // Convert to the format needed for backend
        const formatted = members.map((m: Membership) => ({
            membership_id: m.id,
            role_in_project: m.role
        }));
        setProjectForm(prev => ({ ...prev, selectedMembers: formatted }));
    };


    const updateSelectedAssitance = (assistnace: any) => {
        // Convert to the format needed for backend
        const formatted = assistnace.map((a: Assistance) => ({
            assistance_id: a.id,
        }));
        setProjectForm(prev => ({ ...prev, selectedAssistances: formatted }));
    };


    const handleClearForm = () => {
        setProjectForm({
            organisation_id: organisation?.id,
            name: "",
            description: "",
            status: "pending",
            start_date: undefined,
            end_date: undefined,
            selectedMembers: [],
            selectedAssistances: [],
        });
    };


    const refreshCurrentPage = (page: number) => {
        filterMode ? filterData(page, filters) : getData(page, searchTerm);
    };


    const handleSubmit = async (id?: number): Promise<boolean> => {
        const { hasErrors, errors } = validateProject(projectForm);

        if (hasErrors) {
            setErrors(errors);
            console.log("Validation failed:", errors);
            return false;
        }

        try {
            let result;

            const submitData = {
                organisation_id: projectForm.organisation_id,
                name: projectForm.name,
                description: projectForm.description,
                start_date: projectForm.start_date,
                end_date: projectForm.end_date,
                status: projectForm.status,
                selectedMembers: projectForm.selectedMembers,
                selectedAssistances: projectForm.selectedAssistances
            };

            if (id) {
                result = await updateData(id, submitData);
            } else {
                result = await createData(submitData);
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


    // const handleView = async (id: number): Promise<any> => {
    //     const response = await fetchOneData(id);

    //     // Pre-fill form for editing
    //     setProjectForm({
    //         organisation_id: response.organisation_id,
    //         name: response.name,
    //         description: response.description,
    //         status: response.status,
    //         start_date: response.start_date,
    //         end_date: response.end_date,
    //         selectedMembers: response.members?.map((m: any) => ({
    //             membership_id: m.membership_id,
    //             role_in_project: m.role_in_project
    //         })) || [],
    //         selectedAssistances: response.assistances?.map((a: any) => ({
    //             assistance_id: a.assistance_id
    //         })) || []
    //     });

    //     return response;
    // };



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
        errors,
        projectForm,
        searchTerm,
        filterMode,
        filters,

        handleChange,
        handleSubmit,
        // handleView,
        handleToggle,
        handleClearForm,

        handleSearch,
        clearSearch,
        refreshCurrentPage,

        toggleFilter,
        handleStatusChange,
        handleDatePresetChange,

        updateSelectedMembers,
        updateSelectedAssitance
        
    }
}


