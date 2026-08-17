import { Op } from 'sequelize';
import { BeneficiaryRepository, BeneficiaryMemberRepository } from './beneficiary.repository.js';
import { logAudit } from '../../shared/utils/auditLogger.js';


// ============================================================
// Beneficiary
// ============================================================

export const BeneficiaryService = {

    fetchAll: async (userRole: string | undefined, membershipId: any, organisationId: any, page: number, limit: number) => {
        const offset = (page - 1) * limit;
        const whereClause: any = {};

        if (userRole === 'collaborator') {
            const collaboratorProjects = await BeneficiaryRepository.getCollaboratorProjectIds(membershipId);
            const projectIds = collaboratorProjects.map((pm: any) => pm.project_id);

            if (projectIds.length === 0) {
                return { rows: [], count: 0 };
            }

            whereClause.project_id = { [Op.in]: projectIds };
            whereClause.review_status = { [Op.ne]: 'false' };
        }

        const { count, rows } = await BeneficiaryRepository.findAndCountAll(whereClause, organisationId, limit, offset);
        const overall = await BeneficiaryRepository.countOverview(organisationId);

        const beneficiariesData = rows.map((b: any) => {
            const data: any = b.dataValues || b;
            return {
                ...data,
                members: data.members?.map((m: any) => m.dataValues || m) || [],
                project: data.project?.dataValues || data.project,
                createdBy: data.createdBy?.dataValues || data.createdBy,
                reviewedBy: data.reviewedBy?.dataValues || data.reviewedBy
            };
        });

        return { rows: beneficiariesData, count, overall: overall };
    },

    fetchOne: async (id: string | undefined, userRole: string | undefined, membershipId: any) => {
        if (!id) return { notFound: true };

        const beneficiaryData = await BeneficiaryRepository.findOne({ id });
        const beneficiary = beneficiaryData?.dataValues;

        if (!beneficiary) return { notFound: true };

        if (userRole === 'collaborator') {
            const hasAccessData = await BeneficiaryRepository.checkProjectAccess(beneficiary.project_id, membershipId);
            if (!hasAccessData?.dataValues) return { notFound: false, accessDenied: true };
        }

        return { notFound: false, accessDenied: false, data: beneficiary };
    },

    search: async (q: string, userRole: string | undefined, membershipId: any, organisationId: any, page: number, limit: number) => {
        const offset = (page - 1) * limit;

        const whereClause: any = {
            [Op.or]: [
                { head_name: { [Op.like]: `%${q}%` } },
                { family_code: { [Op.like]: `%${q}%` } },
                { phone: { [Op.like]: `%${q}%` } }
            ]
        };

        if (userRole === 'collaborator') {
            const collaboratorProjects = await BeneficiaryRepository.getCollaboratorProjectIds(membershipId);
            const projectIds = collaboratorProjects.map((pm: any) => pm.project_id);

            if (projectIds.length === 0) {
                return { rows: [], count: 0 };
            }

            whereClause.project_id = { [Op.in]: projectIds };
        }

        const { count, rows } = await BeneficiaryRepository.findAndCountAll(whereClause, organisationId, limit, offset);
        const overall = await BeneficiaryRepository.countOverview(organisationId);

        return { rows, count, overall };
    },

    filter: async (
        userRole: string | undefined,
        membershipId: any,
        organisationId: any,
        reviewStatus: string | undefined,
        projectId: number | undefined,
        datePreset: string | undefined,
        page: number,
        limit: number
    ) => {
        const offset = (page - 1) * limit;
        const whereClause: any = {};

        if (reviewStatus) {
            whereClause.review_status = reviewStatus;
        }

        if (projectId) {
            whereClause.project_id = projectId;
        }

        if (datePreset && datePreset !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            whereClause.created_at = {};

            switch (datePreset) {
                case "today":
                    whereClause.created_at[Op.gte] = today;
                    whereClause.created_at[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case "this_week":
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    whereClause.created_at[Op.gte] = weekStart;
                    break;
                case "this_month":
                    whereClause.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case "this_year":
                    whereClause.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
                    break;
            }
        }

        if (userRole === 'collaborator') {
            const collaboratorProjects = await BeneficiaryRepository.getCollaboratorProjectIds(membershipId);
            const projectIds = collaboratorProjects.map((pm: any) => pm.project_id);

            if (projectIds.length === 0) {
                return { rows: [], count: 0 };
            }

            whereClause.project_id = { [Op.in]: projectIds };
        }

        const { count, rows } = await BeneficiaryRepository.findAndCountAll(whereClause, organisationId, limit, offset);
        const overall = await BeneficiaryRepository.countOverview(organisationId);

        return { rows, count, overall };
    },

    reviewBeneficiary: async (
        id: string | undefined,
        action: string,
        review_note: string,
        membershipId: any,
        req: any
    ) => {
        if (!id) return { notFound: true };

        const beneficiaryData = await BeneficiaryRepository.findByPk(id);
        const beneficiary = beneficiaryData?.dataValues;

        if (!beneficiary) return { notFound: true };

        const hasAccessData = await BeneficiaryRepository.checkProjectAccess(beneficiary.project_id, membershipId);
        if (!hasAccessData?.dataValues) return { notFound: false, accessDenied: true };

        if (beneficiary.review_status !== 'pending') return { notFound: false, accessDenied: false, alreadyReviewed: true };

        await BeneficiaryRepository.update(beneficiaryData, {
            review_status: action === 'approve' ? 'approved' : 'rejected',
            reviewed_by_membership_id: membershipId,
            reviewed_at: new Date(),
            review_note: review_note?.trim() || null,
            updated_at: new Date()
        });

        await logAudit({
            req,
            action: action === 'approve' ? 'approved' : 'rejected',
            entityType: "beneficiary",
            entityId: beneficiary.project_id,
            metadata: {
                "Family Code": beneficiary?.family_code,
                "Family Head": beneficiary?.head_name,
            }
        });

        return { notFound: false, accessDenied: false, alreadyReviewed: false, data: beneficiary };
    },

    delete: async (id: string | undefined, status: string, req: any) => {
        if (!id) return { notFound: true };

        const beneficaryData = await BeneficiaryRepository.findByPk(id);
        const beneficary = beneficaryData?.dataValues;

        if (!beneficary) return { notFound: true };

        let members = 0;
        if (beneficary?.id) {
            members = await BeneficiaryMemberRepository.count(beneficary.id) as any;
        }

        await BeneficiaryRepository.update(beneficaryData, {
            review_status: "false"
        });

        await logAudit({
            req,
            action: status == "true" ? "Enabled" : status == "blocked" ? "Blocked" : "Deleted",
            entityType: "beneficiary",
            entityId: beneficary.id,
            metadata: {
                Familly_Code: beneficary.family_code,
                Familly_Head: beneficary.head_name,
                Members: `${members} Member(s)`,
                status,
            }
        });

        return { notFound: false, data: { id: beneficary.id, status } };
    },

};