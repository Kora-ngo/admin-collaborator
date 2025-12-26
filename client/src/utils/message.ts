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
    { key: "email_already_in_use", message: "This user is already in use." }


];
