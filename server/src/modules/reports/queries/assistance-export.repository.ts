import { Op } from 'sequelize';
import { DeliveryModel, DeliveryItemModel, BeneficiaryModel, AssistanceModel, AssistanceTypeModel } from '../../index.js';

export const AssistanceExportRepository = {
    findForExport: async (projectId: number, from?: string, to?: string) => {
        const deliveryWhere: any = {
            project_id: projectId,
            review_status: { [Op.ne]: 'false' },
        };

        if (from && to) {
            deliveryWhere.delivery_date = { [Op.gte]: new Date(from), [Op.lte]: new Date(`${to}T23:59:59`) };
        }

        // Step 1 — deliveries for this project/period
        const deliveries = await DeliveryModel.findAll({
            where: deliveryWhere,
            order: [['delivery_date', 'ASC']],
            raw: true,
            logging: console.log,
        });

        console.log('[assistance-export] deliveries found:', deliveries.length);

        if (deliveries.length === 0) return [];

        const deliveryIds = deliveries.map((d: any) => d.id);
        const beneficiaryIds = [...new Set(deliveries.map((d: any) => d.beneficiary_id))];

        // Step 2 — delivery items for those deliveries (direct query, no include)
        const items = await DeliveryItemModel.findAll({
            where: { delivery_id: { [Op.in]: deliveryIds } },
            raw: true,
        });

        console.log('[assistance-export] items found:', items.length);

        // Step 3 — beneficiaries referenced by those deliveries
        const beneficiaries = await BeneficiaryModel.findAll({
            where: { id: { [Op.in]: beneficiaryIds } },
            raw: true,
        });

        // Step 4 — assistance + assistance_type, needed to resolve item name/unit
        const assistanceIds = [...new Set(items.map((i: any) => i.assistance_id))];
        const assistances = await AssistanceModel.findAll({
            where: { id: { [Op.in]: assistanceIds } },
            raw: true,
        });
        const assistanceTypeIds = [...new Set(assistances.map((a: any) => a.assistance_id))]; // FK on assistance -> assistance_type
        const assistanceTypes = await AssistanceTypeModel.findAll({
            where: { id: { [Op.in]: assistanceTypeIds } },
            raw: true,
        });

        // ---- Build lookup maps ----
        const beneficiaryMap = new Map(beneficiaries.map((b: any) => [b.id, b]));
        const assistanceMap = new Map(assistances.map((a: any) => [a.id, a]));
        const assistanceTypeMap = new Map(assistanceTypes.map((t: any) => [t.id, t]));
        const deliveryMap = new Map(deliveries.map((d: any) => [d.id, d]));

        // ---- Flatten into one row per delivery item, matching the SQL:
        // SELECT ... FROM delivery_items di
        // JOIN deliveries d ON di.delivery_id = d.id
        // JOIN beneficiaries b ON d.beneficiary_id = b.id
        // JOIN assistance a ON di.assistance_id = a.id
        // JOIN assistance_type at ON a.assistance_id = at.id
        // WHERE d.project_id = ? AND d.review_status != 'false'
        const merged = items.map((item: any) => {
            const delivery = deliveryMap.get(item.delivery_id);
            const beneficiary = delivery ? beneficiaryMap.get(delivery.beneficiary_id) : undefined;
            const assistance = assistanceMap.get(item.assistance_id);
            const assistanceType = assistance ? assistanceTypeMap.get(assistance.assistance_id) : undefined;

            return { item, delivery, beneficiary, assistance, assistanceType };
        });

        console.log('[assistance-export] merged rows:', merged.length);

        return merged;
    },
};