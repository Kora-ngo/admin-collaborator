// Both are now derived from which options are selected (see optionMeta.ts),
// not user-chosen — kept as unions so the derivation logic stays type-safe.
export type ReportType = "DATA_PACKAGE" | "BENEFICIARIES" | "ASSISTANCE" | "ANALYTICS" | "PROJECT_DOCUMENTATION";
export type ReportFormat = "ZIP" | "PDF" | "XLSX" | "DOCX";

export interface ReportingPeriod {
    from: string;
    to: string;
}

export interface ReportOptions {
    projectDocumentation: boolean;
    beneficiaries: boolean;
    assistance: boolean;
    charts: boolean;
}

export interface GenerateReportPayload {
    projectId: string;
    type: ReportType;
    format: ReportFormat;
    reportingPeriod: ReportingPeriod;
    options: ReportOptions;
}

// ── Stored report entity (GET /reports, /reports/:id, etc.) ───────────

// Only COMPLETED was shown in the sample responses — the rest are a
// reasonable guess for an async generation flow (pending -> processing ->
// completed/failed). Status rendering falls back gracefully for anything
// not in this list, so an unlisted value won't break the UI.
export type ReportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ReportUserRef {
    id: number;
    name: string;
    email: string;
}

export interface ReportGeneratedBy {
    id: number;
    role: string;
    user: ReportUserRef;
}

export interface ReportProjectRef {
    id: number;
    name: string;
}

export interface Report {
    id: number;
    uid: number;
    project_id: number;
    organization_id: number;
    type: ReportType;
    format: ReportFormat;
    reporting_period_from?: string;
    reporting_period_to?: string;
    generated_by: number;
    generated_at?: string;
    status: ReportStatus | string;
    file_type: string;
    file_path?: string;
    file_size?: number;
    created_at: string;
    generatedBy?: ReportGeneratedBy;
    project?: ReportProjectRef;
}