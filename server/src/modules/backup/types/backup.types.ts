export type BackupType = "manual" | "automatic";
export type BackupActionStatus = "processing" | "completed" | "failed";
export type BackupStatus = "true" | "false";

export interface BackupRecord {
    id?: number;
    organisation_id: number;
    created_by: number;
    type: BackupType;
    action_status: BackupActionStatus;
    file_name?: string | null;
    file_size?: number | null;
    storage_path?: string | null;
    checksum?: string | null;
    version: number;
    status: BackupStatus;
    created_at?: string;
}

export interface BackupCreateResult {
    id: number;
    file_name: string;
    file_size: number;
    checksum: string;
    version: number;
    created_at: string;
}

export interface BackupManifest {
    version: number;
    kora_version: string;
    created_at: string;
    organisation_id: number;
    organisation_name: string;
    backup_id: number;
    summary: {
        projects: number;
        members: number;
        beneficiaries: number;
        deliveries: number;
        assistances: number;
        media: number;
    };
    checksum: string | null;
}