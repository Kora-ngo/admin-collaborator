import { Op } from 'sequelize';
import BeneficiaryModel from './beneficiary.model.js';
import BeneficiaryMemberModel from '../beneficiary-member/beneficiary-member.model.js';
import ProjectModel from '../project/project.model.js';
import MembershipModel from '../membership/membership.model.js';
import UserModel from '../user/user.model.js';
import ProjectMemberModel from '../project-member/project.member.model.js';


// ============================================================
// Includes
// ============================================================

const fullBeneficiaryInclude = [
    {
        model: ProjectModel,
        as: 'project',
        attributes: ['id', 'name', 'status'],
    },
    {
        model: BeneficiaryMemberModel,
        as: 'members',
        attributes: ['id', 'full_name', 'gender', 'date_of_birth', 'relationship']
    },
    {
        model: MembershipModel,
        as: 'createdBy',
        attributes: ['id', 'role'],
        include: [
            {
                model: UserModel,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }
        ]
    },
    {
        model: MembershipModel,
        as: 'reviewedBy',
        required: false,
        attributes: ['id', 'role'],
        include: [
            {
                model: UserModel,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }
        ]
    }
];


// ============================================================
// Beneficiary
// ============================================================

export const BeneficiaryRepository = {

    countOverview: async (organisationId: number) => {
        const total = await BeneficiaryModel.count({
            include: [{ model: ProjectModel, as: 'project', attributes: [], where: { organisation_id: organisationId } }],
        });
        return total;
    },

    findAndCountAll: async (where: any, organisationId: any, limit: number, offset: number) => {
        return BeneficiaryModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: ProjectModel,
                    as: 'project',
                    attributes: ['id', 'name', 'status'],
                    where: { organisation_id: organisationId }
                },
                {
                    model: BeneficiaryMemberModel,
                    as: 'members',
                    attributes: ['id', 'full_name', 'gender', 'date_of_birth', 'relationship']
                },
                {
                    model: MembershipModel,
                    as: 'createdBy',
                    attributes: ['id', 'role'],
                    include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }]
                },
                {
                    model: MembershipModel,
                    as: 'reviewedBy',
                    required: false,
                    attributes: ['id', 'role'],
                    include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }]
                }
            ],
            limit,
            offset,
            distinct: true
        });
    },

    findOne: async (where: any) => {
        return BeneficiaryModel.findOne({
            where,
            include: fullBeneficiaryInclude
        });
    },

    findByPk: async (id: string | undefined) => {
        if (!id) return null;
        return BeneficiaryModel.findByPk(id);
    },

    update: async (instance: any, data: any) => {
        return instance.update(data);
    },

    getCollaboratorProjectIds: async (membershipId: any) => {
        return ProjectMemberModel.findAll({
            where: {
                membership_id: membershipId,
                role_in_project: 'collaborator'
            },
            attributes: ['project_id'],
            raw: true
        });
    },

    checkProjectAccess: async (projectId: any, membershipId: any) => {
        return ProjectMemberModel.findOne({
            where: {
                project_id: projectId,
                membership_id: membershipId,
                role_in_project: 'collaborator'
            }
        });
    },

};


// ============================================================
// Beneficiary Member
// ============================================================

export const BeneficiaryMemberRepository = {

    count: async (beneficiaryId: any) => {
        return BeneficiaryMemberModel.count({
            where: { beneficiary_id: beneficiaryId }
        });
    },

};