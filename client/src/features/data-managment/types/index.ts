
// ── Types ────────────────────────────────────────────────────────
export type OperationType = "import" | "export";
export type OperationStatus = "completed" | "failed" | "processing";
export type DataEntity = "beneficiaries" | "projects" | "assistance" | "deliveries";
export type TabFilter = "all" | "import" | "export";
export type ModalStep = "configure" | "confirming" | "done";



// ── Dataset scope ────────────────────────────────────────────────
// Backend currently only implements validation for BENEFICIARIES,
// the other members are reserved for when those datasets ship.
export type Dataset = 'BENEFICIARIES' | 'PROJECTS' | 'DELIVERIES' | 'USERS';

// ── Import pipeline ──────────────────────────────────────────────
// Uploaded -> Processing -> Validation -> Completed -> Available in Kora
// "Available in Kora" is not a modal step on its own — it's the state
// the record moves to once the user confirms from "completed".
export type ImportStep = 'upload' | 'processing' | 'validation' | 'completed';

// ── Validation response contract (POST /:dataset/validate) ────────
export type ValidationStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL';

export type IssueSeverity = 'ERROR' | 'WARNING';

export type RowStatus = 'READY' | 'ERROR' | 'WARNING';

export interface ValidationSummary {
    total_rows: number;
    families_detected: number;
    members_detected: number;
    errors: number;
    warnings: number;
}

export interface PreviewProject {
    id: number;
    name: string;
}

export interface PreviewMember {
    name: string;
    gender: string;
    relationship: string;
}

export interface PreviewFamily {
    family_code: string;
    head_name: string;
    project: PreviewProject;
    members: PreviewMember[];
    status: RowStatus;
}

export interface ValidationIssue {
    row: number;
    field: string;
    code: string;
    severity: IssueSeverity;
}

export interface ValidationResult {
    status: ValidationStatus;
    summary: ValidationSummary;
    preview: PreviewFamily[];
    issues: ValidationIssue[];
}