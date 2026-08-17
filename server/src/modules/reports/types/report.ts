export type ReportType = 'DATA_PACKAGE' | 'BENEFICIARIES' | 'ASSISTANCE' | 'ANALYTICS' | 'DONOR_REPORT' | 'PROJECT_DOCUMENTATION';

export type ReportFormat = 'ZIP' | 'XLSX' | 'PDF';

export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ReportPackageOptions {
    projectDocumentation?: boolean;
    beneficiaries?: boolean;
    assistance?: boolean;
    charts?: boolean;
}

export interface ReportAttributes {
    id: number;
    uid: bigint;
    project_id: number;
    organization_id: number;
    type: ReportType;
    format: ReportFormat;
    reporting_period_from?: string; // DATEONLY -> 'YYYY-MM-DD'
    reporting_period_to?: string;
    generated_by: number; // membership.id
    generated_at?: Date;
    status: ReportStatus;
    file_type: string;
    file_path?: string;
    file_size?: number;
    created_at: Date;
}

export type ReportCreationAttributes = Omit<
    ReportAttributes,
    'id' | 'created_at' | 'status' | 'file_type' | 'generated_at' | 'file_path' | 'file_size'
> & {
    status?: ReportStatus;
    file_type?: string;
    generated_at?: Date;
    file_path?: string;
    file_size?: number;
};

// ============================================================
// Request payload shapes (what the frontend sends)
// ============================================================

export interface GenerateReportRequest {
    projectId: string | number;
    type: ReportType;
    format: ReportFormat;
    reportingPeriod?: { from: string; to: string };
    options?: ReportPackageOptions; // only meaningful when type === 'DATA_PACKAGE'
}


export interface GenerateReportRequest {
    projectId: string | number;
    type: ReportType;
    format: ReportFormat;
    reportingPeriod?: { from: string; to: string };
    options?: ReportPackageOptions;
    // DONOR_REPORT only — human-written narrative content. Never
    // auto-generated: the backend only formats/lays out what's provided.
    executiveSummary?: string;
    narrativeHighlights?: string[]; // short bullet-style highlights, optional
}