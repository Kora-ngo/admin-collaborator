export type BackupType = "manual" | "automatic";
export type BackupActionStatus = "processing" | "completed" | "failed";

export interface Backup {
    id: number;
    organisation_id: number;
    created_by: number;
    type: BackupType;
    action_status: BackupActionStatus;
    file_name: string | null;
    file_size: number | null;
    storage_path: string | null;
    checksum: string | null;
    version: number;
    status: "true" | "false";
    created_at: string;
}

export interface BackupCreateResult {
    id: number;
    file_name: string;
    file_size: number;
    checksum: string;
    version: number;
    created_at: string;
}