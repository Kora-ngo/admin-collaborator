import { Op } from 'sequelize';
import sequelize from '../../../config/database.js';
import { OrganisationRepository, OrganisationDeletionRepository } from './organisation.repository.js';

const buildPagination = (count: number, page: number, limit: number) => {
    const totalPages = Math.ceil(count / limit);
    return { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};

const buildDateFilter = (datePreset: string) => {
    if (!datePreset || datePreset === 'all') return undefined;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const filter: any = {};

    switch (datePreset) {
        case 'today':
            filter[Op.gte] = today;
            filter[Op.lt] = new Date(today.getTime() + 86400000);
            break;
        case 'this_week': {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            filter[Op.gte] = weekStart;
            break;
        }
        case 'this_month':
            filter[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'this_year':
            filter[Op.gte] = new Date(now.getFullYear(), 0, 1);
            break;
    }
    return filter;
};

export const OrganisationService = {

    fetchAll: async (page: number, limit: number) => {
        const offset = (page - 1) * limit;
        const { count, rows } = await OrganisationRepository.findAndCountAllList({}, {}, limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },

    fetchOne: async (id: string | undefined) => {
        if (!id) return { notFound: true };
        const organisation = await OrganisationRepository.findByPkDetailed(id);
        if (!organisation) return { notFound: true };
        return { notFound: false, data: organisation };
    },

    filter: async (status: string, country: string, plan: string, datePreset: string, page: number, limit: number) => {
        const offset = (page - 1) * limit;
        const where: any = {};

        if (status === 'true' || status === 'false') where.status = status;
        if (country) where.country = country;

        const dateFilter = buildDateFilter(datePreset);
        if (dateFilter) where.date_of = dateFilter;

        const subscriptionWhere: any = {};
        if (plan && plan !== 'all') subscriptionWhere.plan = plan;

        const { count, rows } = await OrganisationRepository.findAndCountAllList(where, subscriptionWhere, limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },

    search: async (q: string, page: number, limit: number) => {
        if (!q) return { validationError: true };

        const offset = (page - 1) * limit;
        const where = { name: { [Op.like]: `%${q}%` } };

        const { count, rows } = await OrganisationRepository.findAndCountAllList(where, {}, limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },

    toggleStatus: async (id: string | undefined) => {
        if (!id) return { notFound: true };

        const organisation = await OrganisationRepository.findByPk(id);
        if (!organisation) return { notFound: true };

        const newStatus = organisation.dataValues.status === 'true' ? 'blocked' : 'true';
        await OrganisationRepository.update(organisation, { status: newStatus, update_of: new Date() });

        return { notFound: false, data: { id: organisation.id, status: newStatus } };
    },

    // ============================================================
    // Deletion — cascades through every dependent model in FK-safe
    // order, with FK checks disabled for the duration as a belt-and-
    // braces measure (preserved from the original).
    // ============================================================

    deleteOrganisation: async (id: string | undefined) => {
        if (!id) return { notFound: true };

        const orgData = await OrganisationRepository.findByPk(id);
        if (!orgData) return { notFound: true };

        const transaction = await sequelize.transaction();

        try {
            await OrganisationDeletionRepository.disableForeignKeyChecks(transaction);

            const projectIds = await OrganisationDeletionRepository.findProjectIds(id, transaction);
            const beneficiaryIds = await OrganisationDeletionRepository.findBeneficiaryIds(projectIds, transaction);
            const deliveryIds = await OrganisationDeletionRepository.findDeliveryIds(projectIds, transaction);

            await OrganisationDeletionRepository.destroyDeliveryItems(deliveryIds, transaction);
            await OrganisationDeletionRepository.destroyDeliveries(projectIds, transaction);
            await OrganisationDeletionRepository.destroyBeneficiaryMembers(beneficiaryIds, transaction);
            await OrganisationDeletionRepository.destroyBeneficiaries(projectIds, transaction);
            await OrganisationDeletionRepository.destroySyncBatches(projectIds, transaction);
            await OrganisationDeletionRepository.destroyAuditLogs(id, transaction);

            const membershipIds = await OrganisationDeletionRepository.findMembershipIds(id, transaction);
            await OrganisationDeletionRepository.destroyProjectMembers(membershipIds, transaction);
            await OrganisationDeletionRepository.destroyProjectAssistances(projectIds, transaction);

            const mediaIds = await OrganisationDeletionRepository.findMediaIds(id, transaction);
            await OrganisationDeletionRepository.destroyMediaLinks(mediaIds, transaction);
            await OrganisationDeletionRepository.destroyMedia(id, transaction);

            // Assistances (child) before AssistanceTypes (parent)
            await OrganisationDeletionRepository.destroyAssistances(id, transaction);
            await OrganisationDeletionRepository.destroyAssistanceTypes(id, transaction);

            await OrganisationDeletionRepository.destroyProjects(id, transaction);
            await OrganisationDeletionRepository.destroyMemberships(id, transaction);
            await OrganisationDeletionRepository.destroySubscription(id, transaction);
            await OrganisationDeletionRepository.destroyOrganisation(id, transaction);

            await OrganisationDeletionRepository.enableForeignKeyChecks(transaction);

            await transaction.commit();

            return { success: true };
        } catch (error) {
            await OrganisationDeletionRepository.enableForeignKeyChecks().catch(() => {});
            await transaction.rollback();
            throw error;
        }
    },
};