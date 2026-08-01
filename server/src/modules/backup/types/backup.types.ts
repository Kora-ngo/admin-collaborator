export type BackupType = "manual" | "automatic";
export type BackupActionStatus = "processing" | "completed" | "failed";
export type BackupStatus = "true" | "false";
export type BackupFrequency = "daily" | "weekly" | "monthly";

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
    organisation_id: number;
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

export interface BulkBackupResult {
    total: number;
    successful: number;
    failed: number;
    results: {
        organisation_id: number;
        organisation_name: string;
        status: "success" | "failed";
        backup_id?: number;
        error?: string;
    }[];
}

// Backup settings (in-memory for now, DB later)
export interface BackupSettings {
    automatic_enabled: boolean;
    frequency: BackupFrequency;
    retention_days: number | null; // null = forever
}