import type { Transaction } from 'sequelize';
import UserModel from '../user/user.model.js';
import MembershipModel from '../membership/membership.model.js';
import OrganisationModel from '../organisation/organisation.model.js';
import SubscriptionModel from '../subscription/subscription.model.js';

// ============================================================
// User
// ============================================================

export const UserRepository = {

    findByEmail: async (email: string) => {
        return UserModel.findOne({ where: { email } });
    },

    findByPk: async (id: number, options?: { attributes?: string[] }) => {
        return UserModel.findByPk(id, options);
    },

    create: async (data: any, transaction: Transaction) => {
        return UserModel.create(data, { transaction });
    },

    update: async (id: number, data: any, transaction: Transaction) => {
        return UserModel.update(data, { where: { id }, transaction });
    },
};


// ============================================================
// Membership
// ============================================================

export const MembershipRepository = {

    findOneByUserId: async (userId: number) => {
        return MembershipModel.findOne({ where: { user_id: userId } });
    },

    findOneByIdAndUser: async (id: any, userId: any) => {
        return MembershipModel.findOne({ where: { id, user_id: userId } });
    },

    findByPk: async (id: any) => {
        return MembershipModel.findByPk(id);
    },

    create: async (data: any, transaction: Transaction) => {
        return MembershipModel.create(data, { transaction });
    },
};


// ============================================================
// Organisation
// ============================================================

export const OrganisationRepository = {

    findByPk: async (id: any) => {
        return OrganisationModel.findByPk(id);
    },

    findByEmail: async (email: string) => {
        return OrganisationModel.findOne({ where: { email } });
    },

    create: async (data: any, transaction: Transaction) => {
        return OrganisationModel.create(data, { transaction });
    },

    update: async (id: any, data: any, transaction: Transaction) => {
        return OrganisationModel.update(data, { where: { id }, transaction });
    },
};


// ============================================================
// Subscription
// ============================================================

export const SubscriptionRepository = {

    findMostRecentByOrg: async (organizationId: any) => {
        return SubscriptionModel.findOne({
            where: { organization_id: organizationId },
            order: [['ends_at', 'DESC']],
        });
    },

    findMostRecentActiveByOrg: async (organizationId: any) => {
        return SubscriptionModel.findOne({
            where: { organization_id: organizationId, status: 'true' },
            order: [['ends_at', 'DESC']],
        });
    },

    create: async (data: any, transaction: Transaction) => {
        return SubscriptionModel.create(data, { transaction });
    },
};