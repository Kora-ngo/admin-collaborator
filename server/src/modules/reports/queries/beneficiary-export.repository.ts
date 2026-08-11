import { Op } from 'sequelize';
import { BeneficiaryModel, BeneficiaryMemberModel } from '../../index.js';

export const BeneficiaryExportRepository = {
    findForExport: async (projectId: number, from?: string, to?: string) => {
        const where: any = {
            project_id: projectId,
            review_status: { [Op.ne]: 'false' }, // exclude soft-deleted only — pending/approved/rejected all included
        };

        if (from && to) {
            where.created_at = { [Op.gte]: new Date(from), [Op.lte]: new Date(`${to}T23:59:59`) };
        }

        return BeneficiaryModel.findAll({
            where,
            order: [['created_at', 'ASC']],
            include: [{ model: BeneficiaryMemberModel, as: 'members', required: false }],
        });
    },
};