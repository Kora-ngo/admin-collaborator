import { SubscriptionRepository } from './subscription.repository.js';

const buildPagination = (count: number, page: number, limit: number) => {
    const totalPages = Math.ceil(count / limit);
    return { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};

export const SubscriptionService = {

    fetchAll: async (organisationId: any, page: number, limit: number) => {
        if (!organisationId) return { validationError: true };

        const offset = (page - 1) * limit;
        const { count, rows } = await SubscriptionRepository.findAndCountAll(organisationId, limit, offset);

        return { rows, pagination: buildPagination(count, page, limit) };
    },

    fetchCurrent: async (organisationId: any) => {
        if (!organisationId) return { validationError: true };

        const currentSubscription = await SubscriptionRepository.findCurrentActive(organisationId);
        if (!currentSubscription) return { notFound: true };

        return { notFound: false, data: currentSubscription };
    },
};