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
        selectedCollaborator: false,
    };

    // Required: Project name
    if (!form.name?.trim()) {
        errors.name = true;
    }

    // Required: Organisation
    if (!form.organisation_id || form.organisation_id === 0) {
        errors.organisation_id = true;
    }

    // Required: Start date
    if (!form.start_date) {
        errors.start_date = true;
    }

    // Required: End date
    if (!form.end_date) {
        errors.end_date = true;
    }

    // Required: At least one enumerator
    const enumerators = form.selectedMembers.filter(m => m.role_in_project === 'enumerator');
    if (enumerators.length === 0) {
        errors.selectedMembers = true;
    }

    // Required: Exactly one collaborator (project lead)
    const collaborators = form.selectedMembers.filter(m => m.role_in_project === 'collaborator');
    if (collaborators.length === 0) {
        errors.selectedCollaborator = true;
    }

    const hasErrors = Object.values(errors).some(Boolean);

    console.log("Validation errors:", errors);
    console.log("Has errors:", hasErrors);

    return {
        hasErrors,
        errors,
    };
};