import { Op, fn, col } from 'sequelize';
import { BeneficiaryModel, DeliveryModel, DeliveryItemModel, AssistanceModel, AssistanceTypeModel } from '../../index.js';

export const DocumentationExportRepository = {

    // Registration pipeline needs the raw "registered" (submitted) count —
    // AnalyticsService's validation_progress already gives validated/pending/
    // rejected, but not the total-submitted figure broken out separately
    // from period bounds, so we compute it directly here for clarity.
    registrationPipeline: async (projectId: number, start: Date, end: Date) => {
        const where = { project_id: projectId, created_at: { [Op.gte]: start, [Op.lte]: end } };
        const [registered, validated, pending, rejected] = await Promise.all([
            BeneficiaryModel.count({ where: { ...where, review_status: { [Op.ne]: 'false' } } }),
            BeneficiaryModel.count({ where: { ...where, review_status: 'approved' } }),
            BeneficiaryModel.count({ where: { ...where, review_status: 'pending' } }),
            BeneficiaryModel.count({ where: { ...where, review_status: 'rejected' } }),
        ]);
        return { registered, validated, pending, rejected };
    },

    // Per-region actual reach (no planned-per-region target exists in the
    // schema — see module note — so this reports actuals only).
    regionBreakdown: async (projectId: number) => {

        const where = { project_id: projectId, review_status: { [Op.ne]: 'false' }, region: { [Op.ne]: null } };

        const beneficiaryRows = await BeneficiaryModel.findAll({
            where: where,
            attributes: ['region', [fn('COUNT', col('id')), 'beneficiaries']],
            group: ['region'],
            raw: true,
        });

        const whereII = { project_id: projectId, review_status: { [Op.ne]: 'false' }, region: { [Op.ne]: null } };

        const assistedRows = await BeneficiaryModel.findAll({
            where: whereII,
            include: [{ model: DeliveryModel, as: 'deliveries', attributes: [], where: { review_status: 'approved' }, required: true }],
            attributes: ['region', [fn('COUNT', fn('DISTINCT', col('Beneficiary.id'))), 'assisted']],
            group: ['region'],
            raw: true,
        });

        const assistedMap = new Map(assistedRows.map((r: any) => [r.region, Number(r.assisted)]));

        return beneficiaryRows.map((r: any) => ({
            region: r.region,
            beneficiaries: Number(r.beneficiaries),
            assisted: assistedMap.get(r.region) || 0,
        }));
    },

    // Assistance type summary — deliveries count + distinct families assisted
    assistanceTypeBreakdown: async (projectId: number, start: Date, end: Date) => {
        return DeliveryItemModel.findAll({
            include: [
                {
                    model: DeliveryModel, as: 'delivery', attributes: [], required: true,
                    where: { project_id: projectId, review_status: 'approved', delivery_date: { [Op.gte]: start, [Op.lte]: end } },
                },
                {
                    model: AssistanceModel, as: 'assistance', attributes: [], required: true,
                    include: [{ model: AssistanceTypeModel, as: 'assistanceType', attributes: [], required: true }],
                },
            ],
            attributes: [
                [col('assistance.assistanceType.name'), 'type'],
                [fn('COUNT', col('DeliveryItem.id')), 'deliveries'],
                [fn('COUNT', fn('DISTINCT', col('delivery.beneficiary_id'))), 'families_assisted'],
            ],
            group: ['assistance.assistanceType.name'],
            raw: true,
        });
    },

    // Key items distributed — item name + total quantity + unit
    itemsDistributed: async (projectId: number, start: Date, end: Date) => {
        return DeliveryItemModel.findAll({
            include: [
                {
                    model: DeliveryModel, as: 'delivery', attributes: [], required: true,
                    where: { project_id: projectId, review_status: 'approved', delivery_date: { [Op.gte]: start, [Op.lte]: end } },
                },
                {
                    model: AssistanceModel, as: 'assistance', attributes: ['name'], required: true,
                    include: [{ model: AssistanceTypeModel, as: 'assistanceType', attributes: ['unit'], required: true }],
                },
            ],
            attributes: [
                [col('assistance.name'), 'item'],
                [col('assistance.assistanceType.unit'), 'unit'],
                [fn('SUM', col('DeliveryItem.quantity')), 'total_quantity'],
            ],
            group: ['assistance.name', 'assistance.assistanceType.unit'],
            order: [[fn('SUM', col('DeliveryItem.quantity')), 'DESC']],
            raw: true,
        });
    },

    // Weekly activity breakdown within the reporting period
    weeklyActivity: async (projectId: number, start: Date, end: Date) => {
        const [registrations, validations, deliveries] = await Promise.all([
            BeneficiaryModel.findAll({
                where: { project_id: projectId, created_at: { [Op.gte]: start, [Op.lte]: end } },
                attributes: [[fn('YEARWEEK', col('created_at'), 3), 'week'], [fn('COUNT', col('id')), 'value']],
                group: ['week'], order: [[col('week'), 'ASC']], raw: true,
            }),
            BeneficiaryModel.findAll({
                where: { project_id: projectId, review_status: 'approved', reviewed_at: { [Op.gte]: start, [Op.lte]: end } },
                attributes: [[fn('YEARWEEK', col('reviewed_at'), 3), 'week'], [fn('COUNT', col('id')), 'value']],
                group: ['week'], order: [[col('week'), 'ASC']], raw: true,
            }),
            DeliveryModel.findAll({
                where: { project_id: projectId, review_status: 'approved', delivery_date: { [Op.gte]: start, [Op.lte]: end } },
                attributes: [[fn('YEARWEEK', col('delivery_date'), 3), 'week'], [fn('COUNT', col('id')), 'value']],
                group: ['week'], order: [[col('week'), 'ASC']], raw: true,
            }),
        ]);

        const weeks = new Set([...registrations, ...validations, ...deliveries].map((r: any) => r.week));
        const regMap = new Map(registrations.map((r: any) => [r.week, Number(r.value)]));
        const valMap = new Map(validations.map((r: any) => [r.week, Number(r.value)]));
        const delMap = new Map(deliveries.map((r: any) => [r.week, Number(r.value)]));

        return [...weeks].sort().map((week, i) => ({
            label: `Week ${i + 1}`,
            registrations: regMap.get(week) || 0,
            validations: valMap.get(week) || 0,
            deliveries: delMap.get(week) || 0,
        }));
    },
};