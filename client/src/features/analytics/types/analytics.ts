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
    overallProject: number,
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

export interface RegionCoverage {
    region: string;
    covered: boolean;
}

export interface TargetAchievement {
    target: number;
    validated: number;
    percent: number;
}

export interface GeographicCoverage {
    planned_count: number;
    covered_count: number;
    percent: number;
    regions: RegionCoverage[];
}

export interface AssistanceGap {
    validated_families: number;
    assisted_families: number;
    awaiting_assistance: number;
    percent: number;
}

export interface ValidationProgress {
    submitted: number;
    validated: number;
    pending: number;
    rejected: number;
    percent: number;
}

export interface ActivityPoint {
    date: string;
    deliveries: number;
}

export interface ProjectAnalytics {
    id: number;
    name: string;
    status: ProjectStatus;
    country: string;
    target_achievement: TargetAchievement;
    geographic_coverage: GeographicCoverage;
    assistance_gap: AssistanceGap;
    validation_progress: ValidationProgress;
    activity_over_time: ActivityPoint[];
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
    project_performance: ProjectAnalytics[];
    operational_coverage: ChartPoint[];
    data_quality: DataQuality;
}

export interface AnalyticsQueryParams {
    project: string;
    period: string;
    region: string;
}