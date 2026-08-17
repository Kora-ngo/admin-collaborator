import { Op, type Transaction } from 'sequelize';
import {
    OrganisationModel, UserModel, MembershipModel, ProjectModel, AssistanceModel,
    BeneficiaryModel, DeliveryModel, DeliveryItemModel, BeneficiaryMemberModel,
    SyncBatchModel, AuditLogModel, ProjectMemberModel, ProjectAssistanceModel,
    Media, MediaLink, AssistanceTypeModel,
} from '../../index.js';
import SubscriptionModel from '../../subscription/subscription.model.js';
import sequelize from '../../../config/database.js';

// ============================================================
// Include builders
// ============================================================

const ownerInclude = (attributes: string[]) => ({
    model: UserModel,
    as: 'owner',
    attributes,
    foreignKey: 'created_by',
});

const membershipsInclude = (attributes: string[]) => ({
    model: MembershipModel,
    as: 'memberships',
    attributes,
});

const projectsInclude = { model: ProjectModel, as: 'projects', attributes: ['id'] };
const assistancesInclude = { model: AssistanceModel, as: 'assistances', attributes: ['id'] };

const subscriptionInclude = (attributes: string[], where?: any) => ({
    model: SubscriptionModel,
    as: 'subscription',
    attributes,
    required: !!where && Object.keys(where).length > 0,
    where: where && Object.keys(where).length > 0 ? where : undefined,
});


// ============================================================
// Organisation
// ============================================================

export const OrganisationRepository = {

    findAndCountAllList: async (where: any, subscriptionWhere: any, limit: number, offset: number) => {
        return OrganisationModel.findAndCountAll({
            where,
            order: [['date_of', 'DESC']],
            include: [
                ownerInclude(['id', 'name', 'email']),
                membershipsInclude(['id', 'role']),
                projectsInclude,
                assistancesInclude,
                subscriptionInclude(['plan', 'status', 'ends_at'], subscriptionWhere),
            ],
            limit,
            offset,
            distinct: true,
        });
    },

    findByPkDetailed: async (id: string) => {
        return OrganisationModel.findByPk(id, {
            include: [
                ownerInclude(['id', 'name', 'email', 'phone']),
                membershipsInclude(['id', 'role', 'status', 'date_of']),
                subscriptionInclude(['plan', 'status', 'started_at', 'ends_at']),
            ],
        });
    },

    findByPk: async (id: string) => {
        return OrganisationModel.findByPk(id);
    },

    update: async (instance: any, data: any) => {
        return instance.update(data);
    },
};


// ============================================================
// Cascading delete — one repository function per model touched.
// Each accepts the transaction so the service can orchestrate order/atomicity.
// ============================================================

export const OrganisationDeletionRepository = {

    disableForeignKeyChecks: async (transaction: Transaction) => {
        return sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
    },

    enableForeignKeyChecks: async (transaction?: Transaction) => {
        return sequelize.query('SET FOREIGN_KEY_CHECKS = 1', transaction ? { transaction } : undefined);
    },

    findProjectIds: async (organisationId: string, transaction: Transaction) => {
        const projects = await ProjectModel.findAll({ where: { organisation_id: organisationId }, attributes: ['id'], transaction });
        return projects.map(p => (p as any).id);
    },

    findBeneficiaryIds: async (projectIds: any[], transaction: Transaction) => {
        const beneficiaries = await BeneficiaryModel.findAll({ where: { project_id: { [Op.in]: projectIds } }, attributes: ['id'], transaction });
        return beneficiaries.map(b => (b as any).id);
    },

    findDeliveryIds: async (projectIds: any[], transaction: Transaction) => {
        const deliveries = await DeliveryModel.findAll({ where: { project_id: { [Op.in]: projectIds } }, attributes: ['id'], transaction });
        return deliveries.map(d => (d as any).id);
    },

    findMembershipIds: async (organisationId: string, transaction: Transaction) => {
        const memberships = await MembershipModel.findAll({ where: { organization_id: organisationId }, attributes: ['id'], transaction });
        return memberships.map(m => (m as any).id);
    },

    findMediaIds: async (organisationId: string, transaction: Transaction) => {
        const mediaList = await Media.findAll({ where: { organisation_id: organisationId }, attributes: ['id'], transaction });
        return mediaList.map(m => (m as any).id);
    },

    destroyDeliveryItems: async (deliveryIds: any[], transaction: Transaction) => {
        if (deliveryIds.length === 0) return;
        return DeliveryItemModel.destroy({ where: { delivery_id: { [Op.in]: deliveryIds } }, transaction });
    },

    destroyDeliveries: async (projectIds: any[], transaction: Transaction) => {
        return DeliveryModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction });
    },

    destroyBeneficiaryMembers: async (beneficiaryIds: any[], transaction: Transaction) => {
        if (beneficiaryIds.length === 0) return;
        return BeneficiaryMemberModel.destroy({ where: { beneficiary_id: { [Op.in]: beneficiaryIds } }, transaction });
    },

    destroyBeneficiaries: async (projectIds: any[], transaction: Transaction) => {
        return BeneficiaryModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction });
    },

    destroySyncBatches: async (projectIds: any[], transaction: Transaction) => {
        return SyncBatchModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction });
    },

    destroyAuditLogs: async (organisationId: string, transaction: Transaction) => {
        return AuditLogModel.destroy({ where: { organisation_id: organisationId }, transaction });
    },

    destroyProjectMembers: async (membershipIds: any[], transaction: Transaction) => {
        if (membershipIds.length === 0) return;
        return ProjectMemberModel.destroy({ where: { membership_id: { [Op.in]: membershipIds } }, transaction });
    },

    destroyProjectAssistances: async (projectIds: any[], transaction: Transaction) => {
        if (projectIds.length === 0) return;
        return ProjectAssistanceModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction });
    },

    destroyMediaLinks: async (mediaIds: any[], transaction: Transaction) => {
        if (mediaIds.length === 0) return;
        return MediaLink.destroy({ where: { media_id: { [Op.in]: mediaIds } }, transaction });
    },

    destroyMedia: async (organisationId: string, transaction: Transaction) => {
        return Media.destroy({ where: { organisation_id: organisationId }, transaction });
    },

    destroyAssistances: async (organisationId: string, transaction: Transaction) => {
        return AssistanceModel.destroy({ where: { organization_id: organisationId }, transaction });
    },

    destroyAssistanceTypes: async (organisationId: string, transaction: Transaction) => {
        return AssistanceTypeModel.destroy({ where: { organization_id: organisationId }, transaction });
    },

    destroyProjects: async (organisationId: string, transaction: Transaction) => {
        return ProjectModel.destroy({ where: { organisation_id: organisationId }, transaction });
    },

    destroyMemberships: async (organisationId: string, transaction: Transaction) => {
        return MembershipModel.destroy({ where: { organization_id: organisationId }, transaction });
    },

    destroySubscription: async (organisationId: string, transaction: Transaction) => {
        return SubscriptionModel.destroy({ where: { organization_id: organisationId }, transaction });
    },

    destroyOrganisation: async (organisationId: string, transaction: Transaction) => {
        return OrganisationModel.destroy({ where: { id: organisationId }, transaction });
    },
};