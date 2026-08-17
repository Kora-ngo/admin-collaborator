import { AnalyticsRepository, type AnalyticsScope } from './analytics.repository.js';
import { resolvePeriodRange, formatMonthLabel, computeTimeProgress } from './utils/period-range.js';

const trendPercent = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

const round1 = (n: number) => Math.round(n * 10) / 10;


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


const buildProjectMetrics = async (project: any, start: Date, end: Date) => {
        const [
            plannedRegionsRows,
            coveredRegionsRows,
            statusRows, 
            assistedFamilies, 
            activityRows,
        ] = await Promise.all([
            AnalyticsRepository.projectRegionsPlanned(project.id),
            AnalyticsRepository.projectRegionsCovered(project.id),
            AnalyticsRepository.beneficiaryStatusCounts(project.id),
            AnalyticsRepository.assistedFamiliesCount(project.id),
            AnalyticsRepository.deliveriesOverTimeForProject(project.id, start, end),
        ]);

        // ---- Validation Progress ----
        const statusMap: Record<string, number> = {};
        statusRows.forEach((r: any) => { statusMap[r.review_status] = Number(r.value); });



        const submitted = Object.values(statusMap).reduce((sum, v) => sum + v, 0);
        const validated = statusMap['approved'] || 0;
        const pending = statusMap['pending'] || 0;
        const rejected = statusMap['rejected'] || 0;

        // ---- Beneficiary Target Achievement ----
        const target = project.target_families || 0;
        const targetAchievementPercent = target > 0 ? round1((validated / target) * 100) : 0;

        // ---- Geographic Coverage ----
        const plannedRegions = plannedRegionsRows.map((r: any) => r.region);
        const coveredRegionsRaw = coveredRegionsRows.map((r: any) => r.region).filter(Boolean);
        const regionsBreakdown = plannedRegionsRows.map((r: any) => ({
            code: r.code,
            region: r.region,
            covered: coveredRegionsRaw.some((c: string) => c.toLowerCase().trim() === (r.region || '').toLowerCase().trim()),
        }));
        const coveredCount = regionsBreakdown.filter((r) => r.covered).length;
        const geoCoveragePercent = plannedRegions.length > 0
            ? Math.round((coveredCount / plannedRegions.length) * 100)
            : 0;

        // ---- Beneficiary -> Assistance Gap ----
        const assistanceCoveragePercent = validated > 0 ? round1((assistedFamilies / validated) * 100) : 0;
        const awaitingAssistance = Math.max(validated - assistedFamilies, 0);

        return {
            id: project.id,
            name: project.name,
            status: project.status,
            country: project.country,

            target_achievement: {
                target,
                validated,
                percent: targetAchievementPercent,
            },

            geographic_coverage: {
                planned_count: plannedRegions.length,
                covered_count: coveredCount,
                percent: geoCoveragePercent,
                regions: regionsBreakdown, // [{ region: 'CE', covered: true }, ...]
            },

            assistance_gap: {
                validated_families: validated,
                assisted_families: assistedFamilies,
                awaiting_assistance: awaitingAssistance,
                percent: assistanceCoveragePercent,
            },

            validation_progress: {
                submitted,
                validated,
                pending,
                rejected,
                percent: round1(submitted > 0 ? (validated / submitted) * 100 : 0),
            },

            activity_over_time: activityRows.map((r: any) => ({
                date: r.bucket, // 'YYYY-MM-DD' — frontend formats for the axis
                deliveries: Number(r.value),
            })),
        };
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
            overallProject,
            activeProjects, 
            attentionNeeded,
            beneficiariesCurrent, 
            beneficiariesPrevious,
            deliveriesCurrent, 
            deliveriesPrevious,
            beneficiariesSeries, 
            deliveriesSeries,
            beneficiariesByRegionRows, 
            beneficiariesByGenderRows,
            assistanceByTypeRows,
            projectPerformanceRows, 
            operationalCoverageRows,
            dataQuality,
        ] = await Promise.all([
            AnalyticsRepository.countOverviewProjects(organisationId),
            AnalyticsRepository.countActiveProjects(scope),
            AnalyticsRepository.countProjectsNeedingAttention(scope),
            AnalyticsRepository.countBeneficiariesInRange(scope, start, end),
            AnalyticsRepository.countBeneficiariesInRange(scope, prevStart, prevEnd),
            AnalyticsRepository.countDeliveriesInRange(scope, start, end),
            AnalyticsRepository.countDeliveriesInRange(scope, prevStart, prevEnd),
            AnalyticsRepository.beneficiariesOverTime(scope, start, end),
            AnalyticsRepository.deliveriesOverTime(scope, start, end),
            AnalyticsRepository.beneficiariesByRegion(scope, start, end),
            AnalyticsRepository.beneficiariesByGender(scope, start, end),
            AnalyticsRepository.assistanceByType(scope, start, end),
            AnalyticsRepository.projectPerformance(scope),
            AnalyticsRepository.operationalCoverageByRegion(scope),
            AnalyticsRepository.dataQualityCounts(scope),
        ]);

        const totalGenderCount = beneficiariesByGenderRows.reduce((sum: number, r: any) => sum + Number(r.value), 0);
        const validationRateCurrent = dataQuality.total > 0 ? (dataQuality.validated / dataQuality.total) * 100 : 0;

        const projectMetrics = await Promise.all(
            projectPerformanceRows.map((p: any) => buildProjectMetrics(p.dataValues, start, end))
        );

        return {
            filters: {
                applied: { project: projectFilter || 'all', period: period || 'last_30_days', region: regionFilter || 'all' },
                available: await AnalyticsService.getFilters(organisationId),
                overallProject: overallProject
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

            // project_performance: projectPerformanceRows.map((p: any) => ({
            //     id: p.id,
            //     name: p.name,
            //     beneficiaries: p.beneficiaries,
            //     deliveries: p.deliveries,
            //     progress: computeTimeProgress(p.start_date, p.end_date),
            //     status: p.status,
            // })),

            project_performance: projectMetrics,

            operational_coverage: operationalCoverageRows.map((r: any) => ({ label: r.region, value: Number(r.value) })),

            data_quality: {
                ...dataQuality,
                validation_rate: Math.round(validationRateCurrent * 10) / 10,
            },
        };
    },


    // Exposed so other modules (e.g. Report's Analytics PDF export) reuse
    // the exact same per-project calculations instead of duplicating them.
    getProjectMetrics: async (project: any, start: Date, end: Date) => {
        return buildProjectMetrics(project, start, end);
    },
};