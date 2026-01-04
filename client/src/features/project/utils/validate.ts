import type { Project, ProjectMember } from "../../../types/project";

type ProjectFormData = Partial<Project> & {
    selectedMembers: ProjectMember[];
};

export const validateProject = (form: ProjectFormData) => {
    console.log("Project Validation → Form data:", form);

    const errors = {
        name: false,
        organisation_id: false,
        start_date: false,
        end_date: false,
        selectedMembers: false,
    };

    // Required fields (except description & region)
    if (!form.name?.trim()) {
        errors.name = true;
    }

    if (!form.organisation_id || form.organisation_id === 0) {
        errors.organisation_id = true;
    }

    if (!form.start_date) {
        errors.start_date = true;
    }

    if (!form.end_date) {
        errors.end_date = true;
    }

    if (form.selectedMembers.length === 0) {
        errors.selectedMembers = true;
    }

    const hasErrors = Object.values(errors).some(Boolean);

    return {
        hasErrors,
        errors,
    };
};