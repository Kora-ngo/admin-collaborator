export interface FilterOption {
    label: string;
    value: string;
}

export interface AvailableFilters {
    projects: FilterOption[];
    regions: FilterOption[];
}

export interface AppliedFilters {
    project: string;
    period: string;
    region: string;
}

export interface AnalyticsFilters {
    applied: AppliedFilters;
    available: AvailableFilters;
}

export interface TrendKpi {
    value: number;
    trend_percent: number;
    trend_label: string;
}

export interface PointsTrendKpi {
    value: number;
    trend_points: number;
    trend_label: string;
}

export interface ActiveProjectsKpi {
    value: number;
    attention_needed: number;
}

export interface AnalyticsKpis {
    beneficiaries_reached: TrendKpi;
    assistance_deliveries: TrendKpi;
    active_projects: ActiveProjectsKpi;
    validation_rate: PointsTrendKpi;
}

export interface ChartPoint {
    label: string;
    value: number;
}

export type ProjectStatus = "pending" | "ongoing" | "overdue" | "done" | "suspended";

export interface ProjectPerformanceRow {
    id: number;
    name: string;
    beneficiaries: number;
    deliveries: number;
    progress: number;
    status: ProjectStatus;
}

export interface DataQuality {
    total: number;
    validated: number;
    pending: number;
    rejected: number;
    validation_rate: number;
}

export interface AnalyticsData {
    filters: AnalyticsFilters;
    kpis: AnalyticsKpis;
    beneficiaries_over_time: ChartPoint[];
    deliveries_over_time: ChartPoint[];
    beneficiaries_by_region: ChartPoint[];
    beneficiaries_by_gender: ChartPoint[];
    assistance_by_type: ChartPoint[];
    project_performance: ProjectPerformanceRow[];
    operational_coverage: ChartPoint[];
    data_quality: DataQuality;
}

export interface AnalyticsQueryParams {
    project: string;
    period: string;
    region: string;
}