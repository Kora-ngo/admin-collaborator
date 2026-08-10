import { AnalyticsRepository, type AnalyticsScope } from './analytics.repository.js';
import { resolvePeriodRange, formatMonthLabel, computeTimeProgress } from './utils/period-range.js';

const trendPercent = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

const fillTimeSeries = (rows: { bucket: string; value: string | number }[]) =>
    rows.map((r) => ({ label: formatMonthLabel(r.bucket), value: Number(r.value) }));

const buildScope = async (
    userRole: string, membershipId: any, organisationId: number, projectFilter?: string
): Promise<AnalyticsScope> => {
    const scope: AnalyticsScope = { organisationId };

    if (projectFilter && projectFilter !== 'all') {
        scope.projectIds = [Number(projectFilter)];
        return scope;
    }

    if (userRole === 'collaborator') {
        scope.projectIds = await AnalyticsRepository.findProjectIdsForMembership(membershipId);
    }

    return scope;
};

export const AnalyticsService = {

    // ============================================================
    // Filters (dropdown population)
    // ============================================================
    getFilters: async (organisationId: number) => {
        const [projects, regions] = await Promise.all([
            AnalyticsRepository.findAvailableProjects(organisationId),
            AnalyticsRepository.findAvailableRegions(organisationId),
        ]);

        return {
            projects: projects.map((p: any) => ({ label: p.dataValues.name, value: String(p.dataValues.id) })),
            regions: regions.map((r: any) => ({ label: r.region, value: r.region })).filter((r: any) => r.value),
        };
    },

    // ============================================================
    // Full analytics payload
    // ============================================================
    getAnalytics: async (
        userRole: string, membershipId: any, organisationId: number,
        projectFilter: string, period: string, regionFilter: string
    ) => {
        const scope = await buildScope(userRole, membershipId, organisationId, projectFilter);
        const { start, end, prevStart, prevEnd } = resolvePeriodRange(period);

        // NOTE: regionFilter is accepted but not yet applied to every query below —
        // beneficiaries.region and project_regions.region use different vocabularies
        // (see module-level assumption note). Flagging as a follow-up once that's resolved.

        const [
            activeProjects, attentionNeeded,
            beneficiariesCurrent, beneficiariesPrevious,
            deliveriesCurrent, deliveriesPrevious,
            beneficiariesSeries, deliveriesSeries,
            beneficiariesByRegionRows, beneficiariesByGenderRows,
            assistanceByTypeRows,
            projectPerformanceRows, operationalCoverageRows,
            dataQuality,
        ] = await Promise.all([
            AnalyticsRepository.countActiveProjects(scope),
            AnalyticsRepository.countProjectsNeedingAttention(scope),
            AnalyticsRepository.countBeneficiariesInRange(scope, start, end),
            AnalyticsRepository.countBeneficiariesInRange(scope, prevStart, prevEnd),
            AnalyticsRepository.countDeliveriesInRange(scope, start, end),
            AnalyticsRepository.countDeliveriesInRange(scope, prevStart, prevEnd),
            AnalyticsRepository.beneficiariesOverTime(scope, start, end),
            AnalyticsRepository.deliveriesOverTime(scope, start, end),
            AnalyticsRepository.beneficiariesByRegion(scope, start, end),
            AnalyticsRepository.beneficiariesByHeadGender(scope, start, end),
            AnalyticsRepository.assistanceByType(scope, start, end),
            AnalyticsRepository.projectPerformance(scope),
            AnalyticsRepository.operationalCoverageByRegion(scope),
            AnalyticsRepository.dataQualityCounts(scope),
        ]);

        const totalGenderCount = beneficiariesByGenderRows.reduce((sum: number, r: any) => sum + Number(r.value), 0);
        const validationRateCurrent = dataQuality.total > 0 ? (dataQuality.validated / dataQuality.total) * 100 : 0;

        return {
            filters: {
                applied: { project: projectFilter || 'all', period: period || 'last_30_days', region: regionFilter || 'all' },
                available: await AnalyticsService.getFilters(organisationId),
            },

            kpis: {
                beneficiaries_reached: {
                    value: beneficiariesCurrent,
                    trend_percent: trendPercent(beneficiariesCurrent, beneficiariesPrevious),
                    trend_label: 'vs previous period',
                },
                assistance_deliveries: {
                    value: deliveriesCurrent,
                    trend_percent: trendPercent(deliveriesCurrent, deliveriesPrevious),
                    trend_label: 'vs previous period',
                },
                active_projects: { value: activeProjects, attention_needed: attentionNeeded },
                validation_rate: {
                    value: Math.round(validationRateCurrent * 10) / 10,
                    trend_points: 0, // requires storing a historical snapshot to diff against — not available yet
                    trend_label: 'vs previous period',
                },
            },

            beneficiaries_over_time: fillTimeSeries(beneficiariesSeries as any),
            deliveries_over_time: fillTimeSeries(deliveriesSeries as any),

            beneficiaries_by_region: beneficiariesByRegionRows.map((r: any) => ({ label: r.region, value: Number(r.value) })),

            beneficiaries_by_gender: beneficiariesByGenderRows.map((r: any) => ({
                label: r.gender.charAt(0).toUpperCase() + r.gender.slice(1),
                value: totalGenderCount > 0 ? Math.round((Number(r.value) / totalGenderCount) * 100) : 0,
            })),

            assistance_by_type: assistanceByTypeRows.map((r: any) => ({ label: r.label, value: Number(r.value) })),

            project_performance: projectPerformanceRows.map((p: any) => ({
                id: p.id,
                name: p.name,
                beneficiaries: p.beneficiaries,
                deliveries: p.deliveries,
                progress: computeTimeProgress(p.start_date, p.end_date),
                status: p.status,
            })),

            operational_coverage: operationalCoverageRows.map((r: any) => ({ label: r.region, value: Number(r.value) })),

            data_quality: {
                ...dataQuality,
                validation_rate: Math.round(validationRateCurrent * 10) / 10,
            },
        };
    },
};