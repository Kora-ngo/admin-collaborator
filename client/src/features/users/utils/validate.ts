// src/features/membership/utils/validate.ts

import type { Membership } from "../../../types/membership";

export const validateMembership = (
    form: Partial<Membership & { email: string; name: string; phone?: string; password: string }>,
    isEdit: boolean = false
) => {
    console.log("Membership - Validation --> ", form);
    console.log("Membership -  II --> ", form.organization_id);
    const errors = {
        name: false,
        organization_id: false,
        role: false,
        email: false,
        password: false
    };

    // Required fields
    if (!form.name) {
        errors.name = true;
    }



    if (!form.organization_id || form.organization_id === 0) {
        errors.organization_id = true;
    }

    if (!form.role || !["admin", "collaborator", "enumerator"].includes(form.role)) {
        errors.role = true;
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if(!emailRegex.test(form.email!)){
        errors.email = true;
    }

    if (form.password!.length === 0) {
        errors.password = true
    }

    // On create: either user_id OR email must be provided
    if (!isEdit) {
        if (!form.user_id && !form.email?.trim()) {
            errors.email = true;
        }
    }

    const hasErrors = Object.values(errors).some(Boolean);

    // Clean data for submission
    const data: any = {
        organization_id: form.organization_id,
        role: form.role,
    };

    if (form.email) data.email = form.email.trim().toLowerCase();
    if (form.name) data.name = form.name.trim();
    if (form.phone) data.phone = form.phone.trim();
    if (form.password) data.password = form.password;

    return { hasErrors, formErrors: errors, data };
};