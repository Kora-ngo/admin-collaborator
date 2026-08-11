import { Op } from 'sequelize';
import { DeliveryItemModel, DeliveryModel, BeneficiaryModel, AssistanceModel, AssistanceTypeModel } from '../../index.js';

export const AssistanceExportRepository = {
    findForExport: async (projectId: number, from?: string, to?: string) => {
        const deliveryWhere: any = {
            project_id: projectId,
            review_status: { [Op.ne]: 'false' }, // exclude soft-deleted only — pending/approved/rejected all included
        };

        if (from && to) {
            deliveryWhere.delivery_date = { [Op.gte]: new Date(from), [Op.lte]: new Date(`${to}T23:59:59`) };
        }

        return DeliveryItemModel.findAll({
            include: [
                {
                    model: DeliveryModel,
                    as: 'delivery',
                    where: deliveryWhere,
                    required: true,
                    include: [
                        { model: BeneficiaryModel, as: 'beneficiary', attributes: ['id', 'family_code', 'head_name', 'region', 'village'] },
                    ],
                },
                {
                    model: AssistanceModel,
                    as: 'assistance',
                    attributes: ['id', 'name'],
                    include: [{ model: AssistanceTypeModel, as: 'assistanceType', attributes: ['id', 'name', 'unit'] }],
                },
            ],
            order: [[{ model: DeliveryModel, as: 'delivery' }, 'delivery_date', 'ASC']],
        });
    },
};