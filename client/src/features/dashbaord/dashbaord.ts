export interface KeyMetrics {
    activeProjects: number;
    totalFamilies: number;
    totalDeliveries: number;
    activeFieldUsers: number;
}

export interface ProjectProgress {
    id: number;
    name: string;
    familiesRegistered: number;
    deliveriesCompleted: number;
    daysLeft: number;
    startDate: Date;
    endDate: Date;
    membersCount: number;
    status: ProjectOverviewStatus;
    progressPercentage: number;
}

// ── New consolidated admin overview (GET /dashboard/admin/overview) ────

export interface ExecutiveSnapshot {
    active_projects: number;
    beneficiaries: number;
    deliveries: number;
    pending_review: number;
}

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AlertAction {
    label: string;
    target: string;
}

export interface ProjectDeadline {
    id: number;
    name: string;
    end_date: string;
}

export interface AttentionItem {
    type: string;
    severity: AlertSeverity;
    message: string;
    action: AlertAction;
    count?: number;
    projects?: ProjectDeadline[];
}

export type ProjectOverviewStatus = "pending" | "ongoing" | "overdue" | "done" | "suspended";

export interface ProjectOverviewRow {
    id: number;
    name: string;
    beneficiaries: number;
    deliveries: number;
    progress: number;
    status: ProjectOverviewStatus;
}

export interface RecentActivityItem {
    id: number;
    entity_type: "beneficiary" | "delivery" | "sync" | string;
    action: string;
    actor_role: string;
    created_at: string;
}

export interface AdminDashboardData {
    executive_snapshot: ExecutiveSnapshot;
    attention_required: AttentionItem[];
    project_overview: ProjectProgress[];
    recent_activity: RecentActivityItem[];
}