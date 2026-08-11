import { DashboardAdminRepository, DashboardCollaboratorRepository } from './dashboard.repository.js';

const daysLeft = (endDate: Date | string, today: Date) => {
    const diff = new Date(endDate).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
};

export const DashboardService = {

    // ============================================================
    // Admin — consolidated dashboard
    // ============================================================
    getAdminDashboard: async (organisationId: number) => {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const [
            activeProjects, beneficiaries, deliveries,
            pendingBeneficiaries, pendingDeliveries,
            projectsNearDeadline, ongoingProjects, recentActivityRows,
        ] = await Promise.all([
            DashboardAdminRepository.countActiveProjects(organisationId),
            DashboardAdminRepository.countApprovedBeneficiaries(organisationId),
            DashboardAdminRepository.countApprovedDeliveries(organisationId),
            DashboardAdminRepository.countPendingBeneficiaries(organisationId),
            DashboardAdminRepository.countPendingDeliveries(organisationId),
            DashboardAdminRepository.findProjectsNearDeadline(organisationId, today, sevenDaysFromNow),
            DashboardAdminRepository.findOngoingProjectsWithMembers(organisationId),
            DashboardAdminRepository.findRecentActivity(organisationId, 10),
        ]);

        // ---- Executive snapshot ----
        const executiveSnapshot = {
            active_projects: activeProjects,
            beneficiaries,
            deliveries,
            pending_review: pendingBeneficiaries + pendingDeliveries,
        };

        // ---- Attention / Action required ----
        const attentionRequired: any[] = [];

        if (pendingBeneficiaries > 0) {
            attentionRequired.push({
                type: 'PENDING_VALIDATION',
                severity: 'WARNING',
                message: `${pendingBeneficiaries} beneficiar${pendingBeneficiaries !== 1 ? 'ies' : 'y'} awaiting validation`,
                count: pendingBeneficiaries,
                action: { label: 'Review', target: 'pending_submissions' },
            });
        }

        if (projectsNearDeadline.length > 0) {
            attentionRequired.push({
                type: 'PROJECT_DEADLINE',
                severity: 'WARNING',
                message: `${projectsNearDeadline.length} project${projectsNearDeadline.length !== 1 ? 's' : ''} approaching deadline`,
                count: projectsNearDeadline.length,
                projects: projectsNearDeadline.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    end_date: p.end_date,
                    days_left: daysLeft(p.end_date, today),
                })),
                action: { label: 'View projects', target: 'projects' },
            });
        }

        // ---- Project overview (existing calc, unchanged) ----
        const projectOverview = await Promise.all(
            ongoingProjects.map(async (project: any) => {
                const p = project.toJSON();
                const familiesRegistered = await DashboardAdminRepository.countApprovedBeneficiariesForProject(p.id);
                const deliveriesCompleted = await DashboardAdminRepository.countApprovedDeliveriesForProject(p.id);
                const targetFamilies = p.target_families || 0;
                const progressPercentage = targetFamilies > 0 ? Math.round((familiesRegistered / targetFamilies) * 100) : 0;

                return {
                    id: p.id,
                    name: p.name,
                    familiesRegistered,
                    targetFamilies,
                    deliveriesCompleted,
                    progressPercentage,
                    daysLeft: Math.max(daysLeft(p.end_date, today), 0),
                    startDate: p.start_date,
                    endDate: p.end_date,
                    membersCount: p.members?.length || 0,
                    status: p.status,
                };
            })
        );

        // ---- Recent operational activity ----
        const recentActivity = recentActivityRows.map((row: any) => ({
            id: row.id,
            entity_type: row.entity_type,
            action: row.action,
            actor_role: row.actor_role,
            created_at: row.created_at,
        }));

        return {
            executive_snapshot: executiveSnapshot,
            attention_required: attentionRequired,
            project_overview: projectOverview,
            recent_activity: recentActivity,
        };
    },

    // ============================================================
    // Collaborator
    // ============================================================

    getCollaboratorKeyMetrics: async (membershipId: number, organisationId: number) => {
        const projectIds = await DashboardCollaboratorRepository.findCollaboratorProjectIds(membershipId);

        if (projectIds.length === 0) {
            return { assignedProjects: 0, familiesInProjects: 0, pendingBeneficiaries: 0, pendingDeliveries: 0 };
        }

        const [assignedProjects, familiesInProjects, pendingBeneficiaries, pendingDeliveries] = await Promise.all([
            DashboardCollaboratorRepository.countAssignedProjects(organisationId, projectIds),
            DashboardCollaboratorRepository.countApprovedBeneficiaries(projectIds),
            DashboardCollaboratorRepository.countPendingBeneficiaries(projectIds),
            DashboardCollaboratorRepository.countPendingDeliveries(projectIds),
        ]);

        return { assignedProjects, familiesInProjects, pendingBeneficiaries, pendingDeliveries };
    },

    getCollaboratorEnumeratorActivity: async (membershipId: number) => {
        const projectIds = await DashboardCollaboratorRepository.findCollaboratorProjectIds(membershipId);
        if (projectIds.length === 0) return [];

        const enumeratorsInProjects = await DashboardCollaboratorRepository.findEnumeratorsInProjects(projectIds);

        const uniqueEnumerators = new Map<number, any>();
        enumeratorsInProjects.forEach((pm: any) => {
            const data = pm.toJSON();
            if (!uniqueEnumerators.has(data.membership_id)) uniqueEnumerators.set(data.membership_id, data.membership);
        });

        const activity = await Promise.all(
            Array.from(uniqueEnumerators.values()).map(async (enumerator: any) => {
                const [familiesRegistered, deliveriesLogged, lastBeneficiary, lastDelivery] = await Promise.all([
                    DashboardCollaboratorRepository.countFamiliesRegisteredByEnumerator(enumerator.id, projectIds),
                    DashboardCollaboratorRepository.countDeliveriesLoggedByEnumerator(enumerator.id, projectIds),
                    DashboardCollaboratorRepository.findLastBeneficiaryActivity(enumerator.id, projectIds),
                    DashboardCollaboratorRepository.findLastDeliveryActivity(enumerator.id, projectIds),
                ]);

                const lastSyncDate = [lastBeneficiary?.created_at, lastDelivery?.created_at]
                    .filter(Boolean)
                    .map((d: any) => new Date(d))
                    .sort((a, b) => b.getTime() - a.getTime())[0] || null;

                return {
                    id: enumerator.id,
                    name: enumerator.user?.name || 'Unknown',
                    email: enumerator.user?.email || '-',
                    familiesRegistered,
                    deliveriesLogged,
                    lastSyncDate,
                };
            })
        );

        activity.sort((a, b) => {
            if (!a.lastSyncDate) return 1;
            if (!b.lastSyncDate) return -1;
            return new Date(b.lastSyncDate).getTime() - new Date(a.lastSyncDate).getTime();
        });

        return activity;
    },

    getCollaboratorValidationQueue: async (membershipId: number) => {
        const projectIds = await DashboardCollaboratorRepository.findCollaboratorProjectIds(membershipId);
        if (projectIds.length === 0) return { pendingBeneficiaries: [], pendingDeliveries: [] };

        const [pendingBeneficiaries, pendingDeliveries] = await Promise.all([
            DashboardCollaboratorRepository.findPendingBeneficiaries(projectIds, 20),
            DashboardCollaboratorRepository.findPendingDeliveries(projectIds, 20),
        ]);

        return {
            pendingBeneficiaries: pendingBeneficiaries.map((b: any) => b.toJSON()),
            pendingDeliveries: pendingDeliveries.map((d: any) => d.toJSON()),
        };
    },
};