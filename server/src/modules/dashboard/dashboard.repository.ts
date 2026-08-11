import { Op } from 'sequelize';
import {
    ProjectModel, ProjectMemberModel, MembershipModel,
    BeneficiaryModel, DeliveryModel, UserModel, AuditLogModel,
} from '../index.js';

// ============================================================
// Admin — Executive snapshot
// ============================================================

export const DashboardAdminRepository = {

    countActiveProjects: async (organisationId: number) => {
        return ProjectModel.count({
            where: { status: { [Op.in]: ['ongoing', 'overdue'] }, organisation_id: organisationId },
        });
    },

    countApprovedBeneficiaries: async (organisationId: number) => {
        return BeneficiaryModel.count({
            where: { review_status: 'approved' },
            include: [{ model: ProjectModel, as: 'project', where: { organisation_id: organisationId }, attributes: [] }],
        });
    },

    countApprovedDeliveries: async (organisationId: number) => {
        return DeliveryModel.count({
            where: { review_status: 'approved' },
            include: [{ model: ProjectModel, as: 'project', where: { organisation_id: organisationId }, attributes: [] }],
        });
    },

    countPendingBeneficiaries: async (organisationId: number) => {
        return BeneficiaryModel.count({
            where: { review_status: 'pending' },
            include: [{ model: ProjectModel, as: 'project', where: { organisation_id: organisationId }, attributes: [] }],
        });
    },

    countPendingDeliveries: async (organisationId: number) => {
        return DeliveryModel.count({
            where: { review_status: 'pending' },
            include: [{ model: ProjectModel, as: 'project', where: { organisation_id: organisationId }, attributes: [] }],
        });
    },

    findProjectsNearDeadline: async (organisationId: number, today: Date, withinDate: Date) => {
        return ProjectModel.findAll({
            where: {
                organisation_id: organisationId,
                status: { [Op.in]: ['ongoing', 'overdue'] },
                end_date: { [Op.lte]: withinDate, [Op.gte]: today },
            },
            attributes: ['id', 'name', 'end_date'],
            raw: true,
        });
    },

    findOngoingProjectsWithMembers: async (organisationId: number) => {
        return ProjectModel.findAll({
            where: { status: { [Op.in]: ['ongoing', 'overdue'] }, organisation_id: organisationId },
            order: [['created_at', 'DESC']],
            include: [{ model: ProjectMemberModel, as: 'members', attributes: ['id'] }],
        });
    },

    countApprovedBeneficiariesForProject: async (projectId: number) => {
        return BeneficiaryModel.count({ where: { project_id: projectId, review_status: 'approved' } });
    },

    countApprovedDeliveriesForProject: async (projectId: number) => {
        return DeliveryModel.count({ where: { project_id: projectId, review_status: 'approved' } });
    },

    findRecentActivity: async (organisationId: number, limit: number) => {
        return AuditLogModel.findAll({
            where: {
                organisation_id: organisationId,
                entity_type: { [Op.in]: ['beneficiary', 'delivery', 'sync'] },
            },
            order: [['created_at', 'DESC']],
            limit,
            attributes: ['id', 'entity_type', 'action', 'actor_role', 'created_at'],
            raw: true,
        });
    },
};

// ============================================================
// Collaborator
// ============================================================

export const DashboardCollaboratorRepository = {

    findCollaboratorProjectIds: async (membershipId: number) => {
        const rows = await ProjectMemberModel.findAll({
            where: { membership_id: membershipId, role_in_project: 'collaborator' },
            attributes: ['project_id'],
            raw: true,
        });
        return rows.map((r: any) => r.project_id);
    },

    countAssignedProjects: async (organisationId: number, projectIds: number[]) => {
        return ProjectModel.count({
            where: { organisation_id: organisationId, id: { [Op.in]: projectIds }, status: { [Op.in]: ['ongoing', 'overdue'] } },
        });
    },

    countApprovedBeneficiaries: async (projectIds: number[]) => {
        return BeneficiaryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'approved' } });
    },

    countPendingBeneficiaries: async (projectIds: number[]) => {
        return BeneficiaryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'pending' } });
    },

    countPendingDeliveries: async (projectIds: number[]) => {
        return DeliveryModel.count({ where: { project_id: { [Op.in]: projectIds }, review_status: 'pending' } });
    },

    findEnumeratorsInProjects: async (projectIds: number[]) => {
        return ProjectMemberModel.findAll({
            where: { project_id: { [Op.in]: projectIds }, role_in_project: 'enumerator' },
            include: [{
                model: MembershipModel, as: 'membership', attributes: ['id', 'role'],
                include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
            }],
        });
    },

    countFamiliesRegisteredByEnumerator: async (membershipId: number, projectIds: number[]) => {
        return BeneficiaryModel.count({
            where: { created_by_membership_id: membershipId, project_id: { [Op.in]: projectIds }, review_status: 'approved' },
        });
    },

    countDeliveriesLoggedByEnumerator: async (membershipId: number, projectIds: number[]) => {
        return DeliveryModel.count({
            where: { created_by_membership_id: membershipId, project_id: { [Op.in]: projectIds }, review_status: 'approved' },
        });
    },

    findLastBeneficiaryActivity: async (membershipId: number, projectIds: number[]) => {
        return BeneficiaryModel.findOne({
            where: { created_by_membership_id: membershipId, project_id: { [Op.in]: projectIds } },
            order: [['created_at', 'DESC']], attributes: ['created_at'], raw: true,
        });
    },

    findLastDeliveryActivity: async (membershipId: number, projectIds: number[]) => {
        return DeliveryModel.findOne({
            where: { created_by_membership_id: membershipId, project_id: { [Op.in]: projectIds } },
            order: [['created_at', 'DESC']], attributes: ['created_at'], raw: true,
        });
    },

    findPendingBeneficiaries: async (projectIds: number[], limit: number) => {
        return BeneficiaryModel.findAll({
            where: { project_id: { [Op.in]: projectIds }, review_status: 'pending' },
            order: [['created_at', 'DESC']],
            limit,
            include: [
                { model: ProjectModel, as: 'project', attributes: ['id', 'name'] },
                { model: MembershipModel, as: 'createdBy', attributes: ['id'], include: [{ model: UserModel, as: 'user', attributes: ['name'] }] },
            ],
        });
    },

    findPendingDeliveries: async (projectIds: number[], limit: number) => {
        return DeliveryModel.findAll({
            where: { project_id: { [Op.in]: projectIds }, review_status: 'pending' },
            order: [['created_at', 'DESC']],
            limit,
            include: [
                { model: ProjectModel, as: 'project', attributes: ['id', 'name'] },
                { model: BeneficiaryModel, as: 'beneficiary', attributes: ['id', 'family_code', 'head_name'] },
                { model: MembershipModel, as: 'createdBy', attributes: ['id'], include: [{ model: UserModel, as: 'user', attributes: ['name'] }] },
            ],
        });
    },
};