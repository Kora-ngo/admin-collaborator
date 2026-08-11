import { Op, fn, col, literal } from 'sequelize';
import {
    ProjectModel, ProjectMemberModel,
    BeneficiaryModel, BeneficiaryMemberModel,
    DeliveryModel, DeliveryItemModel,
    AssistanceModel, AssistanceTypeModel,
} from '../index.js';
import ProjectRegionModel from '../project-region/project-region.model.js';

export interface AnalyticsScope {
    organisationId: number;
    projectIds?: number[]; // set when scoping to a single project filter or a collaborator's assigned projects
}

const projectWhere = (scope: AnalyticsScope) => {
    const where: any = { organisation_id: scope.organisationId };
    if (scope.projectIds?.length) where.id = { [Op.in]: scope.projectIds };
    return where;
};

export const AnalyticsRepository = {

    // ============================================================
    // Filters
    // ============================================================

    findAvailableProjects: async (organisationId: number) => {
        return ProjectModel.findAll({
            where: { organisation_id: organisationId, status: { [Op.ne]: 'false' } },
            attributes: ['id', 'name'],
            order: [['name', 'ASC']],
        });
    },

    findAvailableRegions: async (organisationId: number) => {
        // Coded regions assigned at project level (project_regions), not the
        // free-text beneficiary.region — see module-level note on the mismatch.
        return ProjectRegionModel.findAll({
            include: [{ model: ProjectModel, as: 'project', attributes: [], where: { organisation_id: organisationId } }],
            attributes: [[fn('DISTINCT', col('ProjectRegion.region')), 'region']],
            raw: true,
        });
    },

    // ============================================================
    // Scoping helper (collaborator -> their assigned project ids)
    // ============================================================

    findProjectIdsForMembership: async (membershipId: number) => {
        const rows = await ProjectMemberModel.findAll({
            where: { membership_id: membershipId },
            attributes: ['project_id'],
            raw: true,
        });
        return rows.map((r: any) => r.project_id);
    },

    // ============================================================
    // KPIs
    // ============================================================

    countActiveProjects: async (scope: AnalyticsScope) => {
        return ProjectModel.count({ where: { ...projectWhere(scope), status: 'ongoing' } });
    },

    countProjectsNeedingAttention: async (scope: AnalyticsScope) => {
        return ProjectModel.count({ where: { ...projectWhere(scope), status: 'overdue' } });
    },

    countBeneficiariesInRange: async (scope: AnalyticsScope, start: Date, end: Date) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: projectWhere(scope), attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        return BeneficiaryModel.count({
            where: {
                project_id: { [Op.in]: projectIds },
                review_status: { [Op.ne]: 'rejected' },
                created_at: { [Op.gte]: start, [Op.lte]: end },
            },
        });
    },

    countDeliveriesInRange: async (scope: AnalyticsScope, start: Date, end: Date) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: projectWhere(scope), attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        return DeliveryModel.count({
            where: {
                project_id: { [Op.in]: projectIds },
                review_status: { [Op.ne]: 'rejected' },
                created_at: { [Op.gte]: start, [Op.lte]: end },
            },
        });
    },

    // ============================================================
    // Time series
    // ============================================================

    beneficiariesOverTime: async (scope: AnalyticsScope, start: Date, end: Date) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: projectWhere(scope), attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        return BeneficiaryModel.findAll({
            where: {
                project_id: { [Op.in]: projectIds },
                review_status: { [Op.ne]: 'rejected' },
                created_at: { [Op.gte]: start, [Op.lte]: end },
            },
            attributes: [
                [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'bucket'],
                [fn('COUNT', col('id')), 'value'],
            ],
            group: ['bucket'],
            order: [[literal('bucket'), 'ASC']],
            raw: true,
        });
    },

    deliveriesOverTime: async (scope: AnalyticsScope, start: Date, end: Date) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: projectWhere(scope), attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        return DeliveryModel.findAll({
            where: {
                project_id: { [Op.in]: projectIds },
                review_status: { [Op.ne]: 'rejected' },
                created_at: { [Op.gte]: start, [Op.lte]: end },
            },
            attributes: [
                [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'bucket'],
                [fn('COUNT', col('id')), 'value'],
            ],
            group: ['bucket'],
            order: [[literal('bucket'), 'ASC']],
            raw: true,
        });
    },

    // ============================================================
    // Beneficiary breakdowns
    // ============================================================

    beneficiariesByRegion: async (scope: AnalyticsScope, start: Date, end: Date) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: projectWhere(scope), attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        const where: any = {
            project_id: { [Op.in]: projectIds },
            review_status: { [Op.ne]: 'rejected' },
            region: { [Op.ne]: null },
            created_at: { [Op.gte]: start, [Op.lte]: end },
        }

        return BeneficiaryModel.findAll({
            where,
            attributes: ['region', [fn('COUNT', col('id')), 'value']],
            group: ['region'],
            order: [[literal('value'), 'DESC']],
            raw: true,
        });
    },

    // Gender is derived from the family's "Head" member — see module-level assumption note.
    beneficiariesByGender: async (scope: AnalyticsScope, start: Date, end: Date) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: projectWhere(scope), attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        return BeneficiaryMemberModel.findAll({
            include: [{
                model: BeneficiaryModel,
                as: 'beneficiary',
                attributes: [],
                where: {
                    project_id: { [Op.in]: projectIds },
                    review_status: { [Op.ne]: 'rejected' },
                    created_at: { [Op.gte]: start, [Op.lte]: end },
                },
                required: true,
            }],
            attributes: ['gender', [fn('COUNT', col('BeneficiaryMember.id')), 'value']],
            group: ['gender'],
            raw: true,
        });
    },
    // ============================================================
    // Assistance breakdown
    // ============================================================

    assistanceByType: async (scope: AnalyticsScope, start: Date, end: Date) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: projectWhere(scope), attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        return DeliveryItemModel.findAll({
            include: [
                {
                    model: DeliveryModel,
                    as: 'delivery',
                    attributes: [],
                    where: {
                        project_id: { [Op.in]: projectIds },
                        review_status: { [Op.ne]: 'rejected' },
                        created_at: { [Op.gte]: start, [Op.lte]: end },
                    },
                    required: true,
                },
                {
                    model: AssistanceModel,
                    as: 'assistance',
                    attributes: [],
                    include: [{ model: AssistanceTypeModel, as: 'assistanceType', attributes: [] }],
                    required: true,
                },
            ],
            attributes: [
                [col('assistance.assistanceType.name'), 'label'],
                [fn('SUM', col('DeliveryItem.quantity')), 'value'],
            ],
            group: ['assistance.assistanceType.name'],
            order: [[literal('value'), 'DESC']],
            raw: true,
        });
    },

    // ============================================================
    // Project performance table + operational coverage
    // ============================================================

    // projectPerformance: async (scope: AnalyticsScope) => {
    //     const projects = await ProjectModel.findAll({
    //         where: { ...projectWhere(scope), status: { [Op.ne]: 'false' } },
    //         attributes: ['id', 'name', 'status', 'start_date', 'end_date'],
    //         order: [['created_at', 'DESC']],
    //     });

    //     const results = await Promise.all(projects.map(async (p: any) => {
    //         const data = p.dataValues;
    //         const beneficiaries = await BeneficiaryModel.count({
    //             where: { project_id: data.id, review_status: { [Op.ne]: 'rejected' } },
    //         });
    //         const deliveries = await DeliveryModel.count({
    //             where: { project_id: data.id, review_status: { [Op.ne]: 'rejected' } },
    //         });
    //         return { ...data, beneficiaries, deliveries };
    //     }));

    //     return results;
    // },

    projectPerformance: async (scope: AnalyticsScope) => {
        return ProjectModel.findAll({
            where: { ...projectWhere(scope), status: { [Op.ne]: 'false' } },
            attributes: ['id', 'name', 'status', 'country', 'start_date', 'end_date', 'target_families'],
            order: [['created_at', 'DESC']],
        });
    },

    operationalCoverageByRegion: async (scope: AnalyticsScope) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: { ...projectWhere(scope), status: 'ongoing' }, attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        return ProjectRegionModel.findAll({
            where: { project_id: { [Op.in]: projectIds } },
            attributes: ['region', [fn('COUNT', fn('DISTINCT', col('project_id'))), 'value']],
            group: ['region'],
            order: [[literal('value'), 'DESC']],
            raw: true,
        });
    },

    // ============================================================
    // Data quality
    // ============================================================

    dataQualityCounts: async (scope: AnalyticsScope) => {
        const projectIds = scope.projectIds ?? (await ProjectModel.findAll({
            where: projectWhere(scope), attributes: ['id'], raw: true,
        })).map((p: any) => p.id);

        const [
            beneficiariesTotal, beneficiariesValidated, beneficiariesPending, beneficiariesRejected,
            deliveriesTotal, deliveriesValidated, deliveriesPending, deliveriesRejected,
        ] = await Promise.all([
            BeneficiaryModel.count({ where: { project_id: { [Op.in]: projectIds } } }),
            BeneficiaryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'approved' } }),
            BeneficiaryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'pending' } }),
            BeneficiaryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'rejected' } }),
            DeliveryModel.count({ where: { project_id: { [Op.in]: projectIds } } }),
            DeliveryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'approved' } }),
            DeliveryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'pending' } }),
            DeliveryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'rejected' } }),
        ]);

        return {
            total: beneficiariesTotal + deliveriesTotal,
            validated: beneficiariesValidated + deliveriesValidated,
            pending: beneficiariesPending + deliveriesPending,
            rejected: beneficiariesRejected + deliveriesRejected,
        };
    },

    // ============================================================
    // Per-project detailed metrics (target achievement, geo coverage,
    // assistance gap, validation progress, activity over time)
    // ============================================================

    projectRegionsPlanned: async (projectId: number) => {
        return ProjectRegionModel.findAll({
            where: { project_id: projectId },
            attributes: ['region'],
            raw: true,
        });
    },


        // Regions actually reached: the region of any beneficiary who has at
    // least one approved delivery. NOTE: compares against free-text
    // beneficiaries.region — see module-level flag on vocabulary mismatch
    // with project_regions.region (codes vs names).
    projectRegionsCovered: async (projectId: number) => {

        const regionCoverWhere = {
                project_id: projectId,
                review_status: { [Op.ne]: 'false' },
                region: { [Op.ne]: null },
        }

        return BeneficiaryModel.findAll({
            where: regionCoverWhere,
            include: [{
                model: DeliveryModel,
                as: 'deliveries',
                attributes: [],
                where: { review_status: 'approved' },
                required: true,
            }],
            attributes: [[fn('DISTINCT', col('Beneficiary.region')), 'region']],
            raw: true,
        });
    },

    beneficiaryStatusCounts: async (projectId: number) => {
        return BeneficiaryModel.findAll({
            where: { project_id: projectId, review_status: { [Op.ne]: 'false' } },
            attributes: ['review_status', [fn('COUNT', col('id')), 'value']],
            group: ['review_status'],
            raw: true,
        });
    },

    // Distinct families that received at least one approved delivery
    assistedFamiliesCount: async (projectId: number) => {
        return DeliveryModel.count({
            where: { project_id: projectId, review_status: 'approved' },
            distinct: true,
            col: 'beneficiary_id',
        });
    },

    deliveriesOverTimeForProject: async (projectId: number, start: Date, end: Date) => {
        return DeliveryModel.findAll({
            where: {
                project_id: projectId,
                review_status: { [Op.ne]: 'rejected' },
                delivery_date: { [Op.gte]: start, [Op.lte]: end },
            },
            attributes: [
                [fn('DATE_FORMAT', col('delivery_date'), '%Y-%m-%d'), 'bucket'],
                [fn('COUNT', col('id')), 'value'],
            ],
            group: ['bucket'],
            order: [[literal('bucket'), 'ASC']],
            raw: true,
        });
    },
};