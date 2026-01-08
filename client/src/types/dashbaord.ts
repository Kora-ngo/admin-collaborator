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
}