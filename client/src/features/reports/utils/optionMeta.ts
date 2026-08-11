import type { ReportFormat, ReportOptions, ReportType } from "../types/report";

interface OptionMeta {
    label: string;
    description: string;
    type: ReportType;
    format: ReportFormat;
}

// When exactly one option is selected, the report's type/format come from
// here directly. When more than one is selected, the report becomes a
// DATA_PACKAGE bundled as a ZIP instead (see useReportForm's derivation).
export const optionMeta: Record<keyof ReportOptions, OptionMeta> = {
    projectDocumentation: {
        label: "Project Documentation",
        description: "Project overview, objectives, and metadata.",
        type: "PROJECT_DOCUMENTATION",
        format: "PDF",
    },
    beneficiaries: {
        label: "Beneficiaries",
        description: "Registered families and members.",
        type: "BENEFICIARIES",
        format: "XLSX",
    },
    assistance: {
        label: "Assistance",
        description: "Assistance types and delivery records.",
        type: "ASSISTANCE",
        format: "XLSX",
    },
    charts: {
        label: "Charts",
        description: "Visual summaries and trend charts.",
        type: "ANALYTICS",
        format: "PDF",
    },
};