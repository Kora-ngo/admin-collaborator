import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';
import { MembershipModel, OrganisationModel, ProjectMemberModel } from '../index.js';
import UserModel from '../user/user.model.js';

const userInclude = {
    model: UserModel,
    as: 'user',
    attributes: ['id', 'name', 'email', 'phone', 'status'],
    required: true,
};

const organizationInclude = {
    model: OrganisationModel,
    as: 'organization',
    attributes: ['id', 'name'],
    required: true,
};


// ============================================================
// Membership
// ============================================================

export const MembershipRepository = {

    findAll: async (where: any) => {
        return MembershipModel.findAll({
            where,
            order: [['date_of', 'DESC']],
            include: [userInclude, organizationInclude],
        });
    },

    findAndCountAll: async (where: any, limit: number, offset: number) => {
        return MembershipModel.findAndCountAll({
            where,
            order: [['date_of', 'DESC']],
            include: [userInclude, organizationInclude],
            limit,
            offset,
        });
    },

    findAndCountAllByUserName: async (where: any, nameQuery: string, limit: number, offset: number) => {
        return MembershipModel.findAndCountAll({
            where,
            order: [['date_of', 'DESC']],
            include: [
                { ...userInclude, where: { name: { [Op.like]: `%${nameQuery}%` } } },
                organizationInclude,
            ],
            limit,
            offset,
        });
    },

    findOneWithUser: async (id: string) => {
        return MembershipModel.findOne({
            where: { id, status: ['true', 'blocked'] },
            include: [
                { model: UserModel, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'status'] },
            ],
        });
    },

    findByPk: async (id: string) => {
        return MembershipModel.findByPk(id);
    },

    findByPkWithDetails: async (id: number, transaction: Transaction) => {
        return MembershipModel.findByPk(id, {
            include: [
                { model: UserModel, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
                { model: OrganisationModel, as: 'organization', attributes: ['id', 'name'] },
            ],
            transaction,
        });
    },

    findOneByUserAndOrg: async (userId: number, organizationId: any, transaction: Transaction) => {
        return MembershipModel.findOne({
            where: { user_id: userId, organization_id: organizationId },
            attributes: ['id', 'status'],
            transaction,
        });
    },

    create: async (data: any, transaction: Transaction) => {
        return MembershipModel.create(data, { transaction });
    },

    update: async (instance: any, data: any) => {
        return instance.update(data);
    },

    destroy: async (id: number, transaction: Transaction) => {
        return MembershipModel.destroy({ where: { id }, transaction });
    },
};


// ============================================================
// Project Member (role-based scoping helpers)
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

    findEnumeratorMembershipIdsInProjects: async (projectIds: any[]) => {
        const rows = await ProjectMemberModel.findAll({
            where: { project_id: { [Op.in]: projectIds }, role_in_project: 'enumerator' },
            attributes: ['membership_id'],
            raw: true,
        });
        return [...new Set(rows.map(pm => pm.membership_id))];
    },
};


// ============================================================
// User (scoped to membership module's needs)
// ============================================================

export const UserRepository = {

    findByEmail: async (email: string, transaction: Transaction) => {
        return UserModel.findOne({ where: { email }, transaction });
    },

    findByEmailBasic: async (email: string) => {
        return UserModel.findOne({ where: { email }, attributes: ['id', 'email', 'status'] });
    },

    findByPk: async (id: number) => {
        return UserModel.findByPk(id);
    },

    create: async (data: any, transaction: Transaction) => {
        return UserModel.create(data, { transaction });
    },

    destroy: async (id: number, transaction: Transaction) => {
        return UserModel.destroy({ where: { id }, transaction });
    },
};