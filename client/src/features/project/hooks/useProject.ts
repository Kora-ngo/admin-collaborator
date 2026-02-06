import { useCallback, useEffect, useState } from "react"
import type { Project, ProjectAssistance, ProjectMember } from "../../../types/project"
import type { Membership } from "../../../types/membership";
import type { Assistance } from "../../../types/assistance";
import { validateProject } from "../utils/validate";
import { useAuthStore } from "../../auth/store/authStore";
import { useToastStore } from "../../../store/toastStore";
import { useProjectStore } from "../store/projectStore";

export type ProjectFormData = Partial<Project> & {
    selectedMembers: ProjectMember[];
    selectedAssistances: ProjectAssistance[];
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

    const [editMetadata, setEditMetadata] = useState<{
        lockedMembers: { membership_id: number }[];
        lockedAssistances: { assistance_id: number }[];
    } | null>(null);

    const [errors, setErrors] = useState({
        name: false,
        organisation_id: false,
        start_date: false,
        end_date: false,
        selectedMembers: false,
        selectedCollaborator: false,
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
        
        if (name === 'start_date' || name === 'end_date') {
            setProjectForm(prev => ({
                ...prev,
                [name]: value || undefined
            }));
        } else {
            setProjectForm(prev => ({
                ...prev,
                [name]: value || undefined
            }));
        }
    };

    // Combine enumerators (multiple) and collaborator (single) into one array
    const updateSelectedMembers = (enumerators: Membership[], collaboratorId: number) => {
        const members: ProjectMember[] = [];

        // Add all enumerators
        enumerators.forEach((e: Membership) => {
            members.push({
                membership_id: e.id,
                role_in_project: 'enumerator'
            });
        });

        // Add single collaborator if selected
        if (collaboratorId > 0) {
            members.push({
                membership_id: collaboratorId,
                role_in_project: 'collaborator'
            });
        }

        setProjectForm(prev => ({ ...prev, selectedMembers: members }));
        console.log("Combined members:", members);
    };

    const updateSelectedAssitance = (assistance: Assistance[]) => {
        const formatted = assistance.map((a: any) => ({
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
        setEditMetadata(null);
    };

    const refreshCurrentPage = (page: number) => {
        filterMode ? filterData(page, filters) : getData(page, searchTerm);
    };

    const handleSubmit = async (id?: number, files?: File[], filesToDelete?: number[]): Promise<boolean> => {
        const { hasErrors, errors: validationErrors } = validateProject(projectForm);

        if (hasErrors) {
            setErrors(validationErrors);
            console.log("Validation failed:", validationErrors);
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
                selectedAssistances: projectForm.selectedAssistances,
                filesToDelete: filesToDelete || []
            };

            console.log("Submitting project data:", submitData);

            if (id) {
                result = await updateData(id, submitData, files);
            } else {
                result = await createData(submitData, files);
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

    const handleToggle = async (id: number, status: string): Promise<boolean> => {
        if (!id || id <= 0) {
            return false;
        }

        // Check if project can be deleted
        // if (status !== 'false') {
        //     const canDeleteResult = await checkCanDelete(id);
            
        //     if (!canDeleteResult.canDelete) {
        //         showToast({
        //             type: 'error',
        //             message: `Cannot delete: ${canDeleteResult.beneficiaryCount} beneficiaries, ${canDeleteResult.deliveryCount} deliveries exist`
        //         });
        //         return false;
        //     }
        // }

        const result = await toggleData(id, status);
        showToast(result);
        await getData();
        return result.type === "success";
    };

    const handleView = async (id: number): Promise<any> => {
        const response = await fetchOneData(id) as any;
        console.log("Response --> ", response);
        
        // Set edit metadata
        if (response.editMetadata) {
            setEditMetadata(response.editMetadata);
        }

        setProjectForm({
            organisation_id: response.organisation_id,
            name: response.name,
            description: response.description,
            status: response.status,
            start_date: response.start_date,
            end_date: response.end_date,
            selectedMembers: response.members,
            selectedAssistances: response.assistances,
        });
        
        return response;
    };

    const handleStatusUpdate = async (id: number, newStatus: string): Promise<boolean> => {
        if (!id || id <= 0) {
            return false;
        }

        try {
            const result = await updateData(id, { status: newStatus });
            showToast(result);
            await getData();
            return result.type === "success";
        } catch (error) {
            console.error("Status update error:", error);
            return false;
        }
    };

    // const handleCheckCanDelete = async (id: number): Promise<{
    //     canDelete: boolean;
    //     beneficiaryCount: number;
    //     deliveryCount: number;
    //     message: string;
    // }> => {
    //     return await checkCanDelete(id);
    // };

    return {
        errors,
        projectForm,
        searchTerm,
        filterMode,
        filters,
        editMetadata,

        handleChange,
        handleSubmit,
        handleView,
        handleToggle,
        handleClearForm,

        handleSearch,
        clearSearch,
        refreshCurrentPage,

        toggleFilter,
        handleStatusChange,
        handleDatePresetChange,
        handleStatusUpdate,
        // handleCheckCanDelete,

        updateSelectedMembers,
        updateSelectedAssitance
    }
}