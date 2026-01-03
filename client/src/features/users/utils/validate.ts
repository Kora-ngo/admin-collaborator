// src/features/membership/utils/validate.ts

import type { Membership } from "../../../types/membership";

export const validateMembership = (
    form: Partial<Membership & { email: string; name: string; phone?: string; password: string }>,
    isEdit: boolean = false
) => {
    console.log("Membership - Validation --> ", form);
    console.log("Membership - Is Edit --> ", isEdit);

    
    const errors = {
        name: false,
        organization_id: false,
        role: false,
        email: false,
        password: false
    };


    if(isEdit) {
        if (!form.role || !["admin", "collaborator", "enumerator"].includes(form.role)) {
            errors.role = true;
        }

        const data: any = {
            role: form.role,
        };

        const hasErrors = Object.values(errors).some(Boolean);
        return { hasErrors, formErrors: errors, data };
    }
    

    // Always required fields (create & edit)
    if (!form.name?.trim()) {
        errors.name = true;
    }

    if (!form.organization_id || form.organization_id === 0) {
        errors.organization_id = true;
    }

    // Email validation (always, since it's used for user lookup/create)
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!form.email?.trim() || !emailRegex.test(form.email.trim())) {
        errors.email = true;
    }

    // Password: required only on create (when new user is being made)
    if (!isEdit && (!form.password || form.password.length === 0)) {
        errors.password = true;
    }

    // Role validation: ONLY on create (skip on edit)
    if (!isEdit) {
        if (!form.role || !["admin", "collaborator", "enumerator"].includes(form.role)) {
            errors.role = true;
        }
    }
    // On edit: we allow role to be empty/undefined → backend will keep existing value

    const hasErrors = Object.values(errors).some(Boolean);

    // Clean data for submission
    const data: any = {
        organization_id: form.organization_id,
    };

    if (form.email) data.email = form.email.trim().toLowerCase();
    if (form.name) data.name = form.name.trim();
    if (form.phone) data.phone = form.phone?.trim() || null;
    if (form.password && form.password.length > 0) data.password = form.password;

    // Only include role if it's present and valid (mainly for create)
    // On edit: if role is provided, include it; if not, omit → backend ignores
    if (form.role && ["admin", "collaborator", "enumerator"].includes(form.role)) {
        data.role = form.role;
    }

    return { hasErrors, formErrors: errors, data };
};