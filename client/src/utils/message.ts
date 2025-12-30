export interface MessageItem {
    key: string;
    message: string;
}

export const messages: MessageItem[] = [
    // Administrator Registration ----------------------------------->
    { key: "missing_user_or_organisation_data", message: "Required user or organization data is missing." },
    { key: "missing_users_credentials", message: "Email and password are required." },
    { key: "missing_organisation_fields", message: "Some organization details are missing." },
    { key: "email_or_uid_already_exists", message: "This email or ID already exists." },
    {key: "admin_registered_successfully", message: "Successfully Resgister"},
    { key: "organisation_email_already_in_use", message: "This organization is already in use." },
    { key: "email_already_in_use", message: "This user is already in use." },

    // General Login -------------------------------------------------->
    { key: "missing_credentials", message: "Email and password are required." },
    { key: "invalid_email_format", message: "Invalid email format." },
    { key: "user_not_found", message: "Account not found." },
    { key: "invalid_credentials", message: "Incorrect email or password." },
    { key: "user_blocked", message: "This account has been blocked." },
    { key: "user_inactive", message: "This account is inactive." },
    { key: "no_organization_membership", message: "No organization linked to this account." },
    { key: "no_active_subscription", message: "No active subscription found." },


    // Assistance Type ----------------------------------------------->
    { key: "no_data_provided", message: "No data provided." },
    { key: "validation_failed", message: "Validation failed." },
    { key: "record_already_exists", message: "This assistance type already exists." },
    { key: "duplicate_in_batch", message: "Duplicate entry in the list." },
    { key: "done", message: "Operation completed successfully." },
    { key: "foreign_key_constraint", message: "Cannot delete: Assistance type is in use." },


    // GENERAL ----------------------------------------------------------->
    { key: "server_error", message: "Something went wrong. Please try again." },
    { key: "record_not_found", message: "Record not found." }, 
    { key: "fields_required", message: "Required fields are missing." },
    { key: "duplicate_records", message: "Duplicate records detected." },



];
