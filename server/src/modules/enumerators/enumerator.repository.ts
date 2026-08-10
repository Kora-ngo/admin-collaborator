import { Op, type Transaction } from 'sequelize';
import {
    UserModel, MembershipModel, OrganisationModel, SubscriptionModel,
    ProjectModel, ProjectMemberModel, ProjectAssistanceModel,
    AssistanceModel, AssistanceTypeModel, MediaLink, Media,
    BeneficiaryModel, BeneficiaryMemberModel, DeliveryModel, DeliveryItemModel,
    SyncBatchModel,
} from '../index.js';
import ProjectRegionModel from '../project-region/project-region.model.js';

// ============================================================
// Auth
// ============================================================

export const EnumeratorAuthRepository = {
    findUserByEmail: async (email: string) => UserModel.findOne({ where: { email } }),

    findMembershipByUserId: async (userId: number) => MembershipModel.findOne({ where: { user_id: userId } }),

    findActiveSubscription: async (organizationId: number) => {
        return SubscriptionModel.findOne({
            where: { organization_id: organizationId },
            order: [['ends_at', 'DESC']],
        });
    },
};


// ============================================================
// Mobile user / affiliated project data
// ============================================================

const membersInclude = (membershipId: number) => ({
    model: ProjectMemberModel,
    as: 'members',
    where: { membership_id: membershipId }, // always scoped, even for admin on mobile
    required: true,
    include: [
        {
            model: MembershipModel,
            as: 'membership',
            attributes: ['id', 'role'],
            include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
    ],
});

const assistancesInclude = {
    model: ProjectAssistanceModel,
    as: 'assistances',
    include: [
        {
            model: AssistanceModel,
            as: 'assistance',
            attributes: ['id', 'name', 'assistance_id'],
            include: [{ model: AssistanceTypeModel, as: 'assistanceType', attributes: ['id', 'name', 'unit'] }],
        },
    ],
};

const mediaLinksInclude = {
    model: MediaLink,
    as: 'mediaLinks',
    include: [{ model: Media, as: 'media', attributes: ['id', 'file_name', 'file_type', 'storage_path', 'size', 'created_at'] }],
};

const regionsInclude = {
    model: ProjectRegionModel,
    as: 'regions',
};

const reviewedBeneficiariesInclude = {
    model: BeneficiaryModel,
    as: 'beneficiaries',
    where: { review_status: { [Op.in]: ['approved', 'rejected'] } },
    required: false,
    attributes: ['id', 'review_status', 'reviewed_at', 'review_note'],
};

const reviewedDeliveriesInclude = {
    model: DeliveryModel,
    as: 'deliveries',
    where: { review_status: { [Op.in]: ['approved', 'rejected'] } },
    required: false,
    attributes: ['id', 'review_status', 'reviewed_at', 'review_note'],
    include: [{ model: DeliveryItemModel, as: 'items', attributes: ['id', 'assistance_id', 'quantity'] }],
};

export const EnumeratorRepository = {
    findUserByPk: async (userId: number) => UserModel.findByPk(userId),

    findMembershipByPk: async (membershipId: number) => MembershipModel.findByPk(membershipId),

    findOrganisationByPk: async (organisationId: number) => OrganisationModel.findByPk(organisationId),

    findActiveSubscription: async (organizationId: number) => {
        return SubscriptionModel.findOne({
            where: { organization_id: organizationId, status: 'true' },
            order: [['ends_at', 'DESC']],
        });
    },

    // Projects the given membership is affiliated to — includes everything
    // the mobile app needs to render offline. country/settings ride along
    // automatically (plain columns on ProjectModel); regions needs an include.
    findAffiliatedProjects: async (membershipId: number) => {
        return ProjectModel.findAll({
            where: { status: { [Op.ne]: 'false' } },
            order: [['created_at', 'DESC']],
            include: [
                membersInclude(membershipId),
                assistancesInclude,
                mediaLinksInclude,
                regionsInclude,
                reviewedBeneficiariesInclude,
                reviewedDeliveriesInclude,
            ],
        });
    },

    findCollaboratorsForProject: async (projectId: number) => {
        return ProjectMemberModel.findAll({
            where: { project_id: projectId, role_in_project: 'collaborator' },
            include: [
                {
                    model: MembershipModel,
                    as: 'membership',
                    attributes: ['id', 'role'],
                    include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
                },
            ],
        });
    },
};


// ============================================================
// Sync — Project / membership validation + batch record
// ============================================================

export const SyncProjectRepository = {
    findByPk: async (projectId: number) => ProjectModel.findByPk(projectId),

    findEnumeratorAssignment: async (projectId: number, membershipId: number) => {
        return ProjectMemberModel.findOne({
            where: { project_id: projectId, membership_id: membershipId, role_in_project: 'enumerator' },
        });
    },

    createSyncBatch: async (data: any, transaction: Transaction) => SyncBatchModel.create(data, { transaction }),
};

// ============================================================
// Sync — Beneficiaries (used by beneficiary-sync.service.ts)
// ============================================================

export const SyncBeneficiaryRepository = {
    findByPk: async (id: number, transaction: Transaction) => BeneficiaryModel.findByPk(id, { transaction }),

    findDuplicateByFamilyCode: async (projectId: number, familyCode: string, transaction: Transaction) => {
        return BeneficiaryModel.findOne({
            where: { project_id: projectId, family_code: familyCode, review_status: { [Op.ne]: 'rejected' } },
            transaction,
        });
    },

    update: async (instance: any, data: any, transaction: Transaction) => instance.update(data, { transaction }),

    create: async (data: any, transaction: Transaction) => BeneficiaryModel.create(data, { transaction }),

    destroyMembers: async (beneficiaryId: number, transaction: Transaction) => {
        return BeneficiaryMemberModel.destroy({ where: { beneficiary_id: beneficiaryId }, transaction });
    },

    createMember: async (data: any, transaction: Transaction) => BeneficiaryMemberModel.create(data, { transaction }),
};


// ============================================================
// Sync — Deliveries (used by delivery-sync.service.ts)
// ============================================================

export const SyncDeliveryRepository = {
    findByPk: async (id: number, transaction: Transaction) => DeliveryModel.findByPk(id, { transaction }),

    findApprovedBeneficiary: async (beneficiaryId: number, projectId: number, transaction: Transaction) => {
        return BeneficiaryModel.findOne({
            where: { id: beneficiaryId, project_id: projectId, review_status: 'approved' },
            transaction,
        });
    },

    findValidAssistances: async (assistanceIds: number[], transaction: Transaction) => {
        return AssistanceModel.findAll({ where: { id: { [Op.in]: assistanceIds }, status: 'true' }, transaction });
    },

    update: async (instance: any, data: any, transaction: Transaction) => instance.update(data, { transaction }),

    create: async (data: any, transaction: Transaction) => DeliveryModel.create(data, { transaction }),

    destroyItems: async (deliveryId: number, transaction: Transaction) => {
        return DeliveryItemModel.destroy({ where: { delivery_id: deliveryId }, transaction });
    },

    bulkCreateItems: async (data: any[], transaction: Transaction) => DeliveryItemModel.bulkCreate(data, { transaction }),
};