import { Op } from 'sequelize';
import {
    AssistanceModel, AssistanceTypeModel, BeneficiaryModel, DeliveryItemModel,
    DeliveryModel, MembershipModel, ProjectMemberModel, ProjectModel, UserModel
} from '../index.js';

const createdByInclude = {
    model: MembershipModel,
    as: 'createdBy',
    attributes: ['id', 'role'],
    include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
};

const reviewedByInclude = {
    model: MembershipModel,
    as: 'reviewedBy',
    required: false,
    attributes: ['id', 'role'],
    include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
};

const itemsInclude = (assistanceAttributes: string[]) => ({
    model: DeliveryItemModel,
    as: 'items',
    include: [
        {
            model: AssistanceModel,
            as: 'assistance',
            attributes: assistanceAttributes,
            include: [
                { model: AssistanceTypeModel, as: 'assistanceType', attributes: ['id', 'name', 'unit'] },
            ],
        },
    ],
});

const projectIncludeScoped = (organisationId: any) => ({
    model: ProjectModel,
    as: 'project',
    attributes: ['id', 'name', 'status'],
    where: { organisation_id: organisationId },
});

const beneficiaryInclude = (extra: string[] = []) => ({
    model: BeneficiaryModel,
    as: 'beneficiary',
    attributes: ['id', 'family_code', 'head_name', ...extra],
});


// ============================================================
// Delivery
// ============================================================

export const DeliveryRepository = {


    countOverview: async (organisationId: number) => {
        const total = await DeliveryModel.count({
            include: [{ model: ProjectModel, as: 'project', attributes: [], where: { organisation_id: organisationId } }],
        });
        return total;
    },

    findAndCountAllList: async (where: any, organisationId: any, limit: number, offset: number) => {
        return DeliveryModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                projectIncludeScoped(organisationId),
                beneficiaryInclude(),
                itemsInclude(['id', 'name', 'assistance_id']),
                createdByInclude,
                reviewedByInclude,
            ],
            limit,
            offset,
            distinct: true,
        });
    },

    findAndCountAllSearch: async (where: any, organisationId: any, limit: number, offset: number) => {
        return DeliveryModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                projectIncludeScoped(organisationId),
                beneficiaryInclude(),
                itemsInclude(['id', 'name']),
                createdByInclude,
                reviewedByInclude,
            ],
            limit,
            offset,
            distinct: true,
            subQuery: false,
        });
    },

    findAndCountAllFilter: async (where: any, organisationId: any, limit: number, offset: number) => {
        return DeliveryModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                projectIncludeScoped(organisationId),
                beneficiaryInclude(),
                itemsInclude(['id', 'name']),
                createdByInclude,
                reviewedByInclude,
            ],
            limit,
            offset,
            distinct: true,
        });
    },

    // NOTE: unlike the list/search/filter queries, the original fetchOne did NOT
    // scope `project` by organisation_id. Preserved as-is.
    findOneDetailed: async (id: string) => {
        return DeliveryModel.findOne({
            where: { id },
            include: [
                { model: ProjectModel, as: 'project', attributes: ['id', 'name', 'status'] },
                beneficiaryInclude(['phone', 'region', 'village']),
                itemsInclude(['id', 'name', 'assistance_id']),
                createdByInclude,
                reviewedByInclude,
            ],
        });
    },

    findByPk: async (id: string) => {
        return DeliveryModel.findByPk(id);
    },

    countItems: async (deliveryId: any) => {
        return DeliveryItemModel.count({ where: { delivery_id: deliveryId } });
    },

    update: async (instance: any, data: any) => {
        return instance.update(data);
    },
};


// ============================================================
// Project Member (role-based access helpers)
// ============================================================

export const ProjectMemberRepository = {

    findCollaboratorProjectIds: async (membershipId: any) => {
        const rows = await ProjectMemberModel.findAll({
            where: { membership_id: membershipId, role_in_project: 'collaborator' },
            attributes: ['project_id'],
            raw: true,
        });
        return rows.map(pm => pm.project_id);
    },

    findAccess: async (projectId: any, membershipId: any) => {
        return ProjectMemberModel.findOne({
            where: { project_id: projectId, membership_id: membershipId, role_in_project: 'collaborator' },
        });
    },
};