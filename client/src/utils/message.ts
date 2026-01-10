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
    { key: "no_data_provided", message: "Please add at least one item." },
    { key: "validation_failed", message: "Some information is missing or incorrect." },
    { key: "duplicate_in_batch", message: "An Item has been added more than once" },


    // Membership  ---------------------------------------------------->
    { key: "invalid_role", message: "Please select a valid role." },
    { key: "user_already_in_organization", message: "This user is already part of this organization." },
    




    // GENERAL ----------------------------------------------------------->
    { key: "server_error", message: "Something went wrong. Please try again." },
    { key: "record_not_found", message: "Record not found." }, 
    { key: "fields_required", message: "Required fields are missing." },
    { key: "duplicate_records", message: "Duplicate records detected." },
    { key: "uid_already_exists", message: "Identifier conflict detected. Please try again." },
    { key: "record_already_exists", message: "This record already exists." },
    { key: "done", message: "Operation completed successfully." },
    { key: "foreign_key_constraint", message: "This item is currently in use and cannot be deleted." },
    { key: "search_query_required", message: "Please enter a search term." },


    // Global / System Errors ---------------------------------------->
    { key: "file_too_large", message: "The uploaded file is too large." },
    { key: "database_connection_error", message: "Service is temporarily unavailable. Please try again later." },
    { key: "request_timeout", message: "The request took too long. Please try again." },
    { key: "invalid_or_expired_token", message: "Your session has expired. Please log in again." },
    { key: "internal_server_error", message: "Something went wrong. Please try again." },
    { key: "unexpected_error", message: "An unexpected error occurred. Please try again." },









];
