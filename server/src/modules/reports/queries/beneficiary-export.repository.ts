import { Op } from 'sequelize';
import { BeneficiaryModel, BeneficiaryMemberModel } from '../../index.js';

export const BeneficiaryExportRepository = {
    findForExport: async (projectId: number, from?: string, to?: string) => {
        const where: any = {
            project_id: projectId,
            review_status: { [Op.ne]: 'false' },
        };

        if (from && to) {
            where.created_at = { [Op.gte]: new Date(from), [Op.lte]: new Date(`${to}T23:59:59`) };
        }

        // Equivalent to: SELECT * FROM beneficiaries WHERE project_id = ? AND review_status != 'false' ORDER BY created_at ASC
        const beneficiaries = await BeneficiaryModel.findAll({ where, order: [['created_at', 'ASC']], raw: true });

        console.log('[export] beneficiaries found:', beneficiaries.length, JSON.stringify(beneficiaries));

        if (beneficiaries.length === 0) return [];

        const beneficiaryIds = beneficiaries.map((b: any) => b.id);

        // Equivalent to: SELECT * FROM beneficiary_members WHERE beneficiary_id IN (...)
        const members = await BeneficiaryMemberModel.findAll({
            where: { beneficiary_id: { [Op.in]: beneficiaryIds } },
            raw: true,
        });

        console.log('[export] members found:', members.length, JSON.stringify(members));

        const membersByBeneficiary = new Map<number, any[]>();
        members.forEach((m: any) => {
            const list = membersByBeneficiary.get(m.beneficiary_id) || [];
            list.push(m);
            membersByBeneficiary.set(m.beneficiary_id, list);
        });

        const merged = beneficiaries.map((b: any) => ({
            ...b,
            members: membersByBeneficiary.get(b.id) || [],
        }));

        console.log('[export] merged result:', JSON.stringify(merged, null, 2));

        return merged;
    },
};