import { Op } from 'sequelize';
import SubscriptionModel from './subscription.model.js';

export const SubscriptionRepository = {

    findAndCountAll: async (organisationId: any, limit: number, offset: number) => {
        return SubscriptionModel.findAndCountAll({
            where: { organization_id: organisationId },
            order: [['started_at', 'DESC']],
            limit,
            offset,
            distinct: true,
        });
    },

    findCurrentActive: async (organisationId: any) => {
        return SubscriptionModel.findOne({
            where: {
                organization_id: organisationId,
                status: 'true',
                ends_at: { [Op.gte]: new Date() },
            },
            order: [['started_at', 'DESC']],
        });
    },
};