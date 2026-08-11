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