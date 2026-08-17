import { Op, type Transaction } from 'sequelize';
import {
    ProjectModel, ProjectMemberModel, ProjectAssistanceModel, MembershipModel,
    AssistanceModel, UserModel, MediaLink, Media, BeneficiaryModel,
    AssistanceTypeModel, DeliveryItemModel, DeliveryModel, BeneficiaryMemberModel,
} from '../index.js';
import ProjectRegionModel from '../project-region/project-region.model.js';

// ============================================================
// Shared include builders
// ============================================================

const membersInclude = (collaboratorScope?: { membershipId?: any; projectIds?: any[]; roles?: string[] }) => ({
    model: ProjectMemberModel,
    as: 'members',
    ...(collaboratorScope?.projectIds && {
        where: {
            project_id: { [Op.in]: collaboratorScope.projectIds },
            role_in_project: collaboratorScope.roles ?? ['enumerator', 'collaborator'],
        },
        required: true,
    }),
    ...(collaboratorScope?.membershipId && !collaboratorScope.projectIds && {
        where: { membership_id: collaboratorScope.membershipId },
        required: true,
    }),
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
    include: [{ model: AssistanceModel, as: 'assistance', attributes: ['id', 'name'] }],
};

const mediaLinksInclude = {
    model: MediaLink,
    as: 'mediaLinks',
    include: [
        { model: Media, as: 'media', attributes: ['id', 'file_name', 'file_type', 'storage_path', 'size', 'created_at'] },
    ],
};

const approvedBeneficiariesInclude = (withCreatedBy = false) => ({
    model: BeneficiaryModel,
    as: 'beneficiaries',
    where: { review_status: 'approved' },
    required: false,
    include: [
        { model: BeneficiaryMemberModel, as: 'members', attributes: ['id', 'full_name', 'gender', 'date_of_birth', 'relationship'] },
        ...(withCreatedBy ? [{
            model: MembershipModel,
            as: 'createdBy',
            attributes: ['id', 'role'],
            include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
        }] : []),
    ],
});

const approvedDeliveriesInclude = {
    model: DeliveryModel,
    as: 'deliveries',
    where: { review_status: 'approved' },
    required: false,
    include: [
        {
            model: DeliveryItemModel,
            as: 'items',
            include: [
                {
                    model: AssistanceModel,
                    as: 'assistance',
                    attributes: ['id', 'name', 'assistance_id'],
                    include: [{ model: AssistanceTypeModel, as: 'assistanceType', attributes: ['id', 'name', 'unit'] }],
                },
            ],
        },
        { model: BeneficiaryModel, as: 'beneficiary', attributes: ['id', 'family_code', 'head_name', 'phone'] },
    ],
};

const regionsInclude = {
    model: ProjectRegionModel,
    as: 'regions',
};

// ============================================================
// Project
// ============================================================

export const ProjectRepository = {

    countOverview: async (organisationId: number) => {
        const total = await ProjectModel.count({ where: { organisation_id: organisationId } });
        return total;
    },

    findOneByNameInOrg: async (name: string, organisationId: any) => {
        return ProjectModel.findOne({
            where: { name, organisation_id: organisationId, status: { [Op.ne]: 'false' } },
        });
    },

    findAndCountAllFull: async (where: any, collaboratorScope: { membershipId?: any; projectIds?: any[] } | undefined, limit: number, offset: number) => {
        return ProjectModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                membersInclude(collaboratorScope),
                assistancesInclude,
                mediaLinksInclude,
                regionsInclude,
                approvedBeneficiariesInclude(),
                approvedDeliveriesInclude,
            ],
            limit,
            offset,
            distinct: true,
            col: 'id',
        });
    },

    findAndCountAllSummary: async (where: any, collaboratorScope: { membershipId?: any } | undefined, limit: number, offset: number) => {
        return ProjectModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [membersInclude(collaboratorScope), assistancesInclude, mediaLinksInclude, regionsInclude],
            limit,
            offset,
            distinct: true,
            col: 'id',
        });
    },

    findOneDetailed: async (id: string) => {
        return ProjectModel.findOne({
            where: { id, status: { [Op.ne]: 'false' } },
            include: [
                membersInclude(),
                assistancesInclude,
                mediaLinksInclude,
                approvedBeneficiariesInclude(true),
                approvedDeliveriesInclude,
                regionsInclude,
            ],
        });
    },

    findByPk: async (id: string, transaction: Transaction) => {
        return ProjectModel.findByPk(id, { transaction });
    },

    create: async (data: any, transaction: Transaction) => {
        return ProjectModel.create(data, { transaction });
    },

    update: async (instance: any, data: any, transaction?: Transaction) => {
        return instance.update(data, { transaction });
    },
};


// ============================================================
// Project Member
// ============================================================

export const ProjectMemberRepository = {

    findProjectIdsForMembership: async (membershipId: any) => {
        const rows = await ProjectMemberModel.findAll({
            where: { membership_id: membershipId },
            attributes: ['project_id'],
            raw: true,
        });
        return rows.map(pm => pm.project_id);
    },

    findAllForProject: async (projectId: string | number) => {
        return ProjectMemberModel.findAll({ where: { project_id: projectId } });
    },

    bulkCreate: async (data: any[], transaction: Transaction) => {
        return ProjectMemberModel.bulkCreate(data, { transaction });
    },

    destroyExcluding: async (projectId: string | number, keepMembershipIds: any[], transaction: Transaction) => {
        return ProjectMemberModel.destroy({
            where: { project_id: projectId, membership_id: { [Op.notIn]: keepMembershipIds } },
            transaction,
        });
    },
};


// ============================================================
// Project Assistance
// ============================================================

export const ProjectAssistanceRepository = {

    bulkCreate: async (data: any[], transaction: Transaction) => {
        return ProjectAssistanceModel.bulkCreate(data, { transaction });
    },

    destroyExcluding: async (projectId: string | number, keepAssistanceIds: any[], transaction: Transaction) => {
        return ProjectAssistanceModel.destroy({
            where: { project_id: projectId, assistance_id: { [Op.notIn]: keepAssistanceIds } },
            transaction,
        });
    },
};


// ============================================================
// Project Region
// ============================================================

export const ProjectRegionRepository = {

    findAllForProject: async (projectId: string | number) => {
        return ProjectRegionModel.findAll({ where: { project_id: projectId } });
    },

    bulkCreate: async (data: any[], transaction: Transaction) => {
        return ProjectRegionModel.bulkCreate(data, { transaction });
    },

    destroyAllForProject: async (projectId: string | number, transaction: Transaction) => {
        return ProjectRegionModel.destroy({ where: { project_id: projectId }, transaction });
    },
};

// ============================================================
// Deletion eligibility (beneficiary / delivery counts)
// ============================================================

export const ProjectDeletionRepository = {

    countActiveBeneficiaries: async (projectId: string) => {
        return BeneficiaryModel.count({ where: { project_id: projectId, review_status: { [Op.ne]: 'false' } } });
    },

    countActiveDeliveries: async (projectId: string) => {
        return DeliveryModel.count({ where: { project_id: projectId, review_status: { [Op.ne]: 'false' } } });
    },
};