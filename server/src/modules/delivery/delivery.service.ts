import { Op } from 'sequelize';
import { DeliveryRepository, ProjectMemberRepository } from './delivery.repository.js';

const emptyPagination = (page: number, limit: number) => ({
    total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false,
});

const buildPagination = (overall: number, count: number, page: number, limit: number) => {
    const totalPages = Math.ceil(count / limit);
    return { overall: overall, total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};

const buildDateFilter = (datePreset: string) => {
    if (!datePreset || datePreset === 'all') return undefined;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const filter: any = {};

    switch (datePreset) {
        case 'today':
            filter[Op.gte] = today;
            filter[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
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

const normalizeDelivery = (d: any) => {
    const data = d.dataValues || d;
    return {
        ...data,
        items: data.items?.map((i: any) => i.dataValues || i) || [],
        beneficiary: data.beneficiary?.dataValues || data.beneficiary,
        project: data.project?.dataValues || data.project,
        createdBy: data.createdBy?.dataValues || data.createdBy,
        reviewedBy: data.reviewedBy?.dataValues || data.reviewedBy,
    };
};

// Shared: resolve collaborator project-scoping. Returns null if the caller
// (non-collaborator) needs no restriction, [] if collaborator has no projects
// (caller should short-circuit to an empty page), or the id list otherwise.
const resolveCollaboratorProjectIds = async (userRole: string | undefined, membershipId: any) => {
    if (userRole !== 'collaborator') return null;
    return ProjectMemberRepository.findCollaboratorProjectIds(membershipId);
};

export const DeliveryService = {

    fetchAll: async (userRole: string | undefined, membershipId: any, organizationId: any, page: number, limit: number) => {
        const offset = (page - 1) * limit;
        const whereClause: any = {};

        const projectIds = await resolveCollaboratorProjectIds(userRole, membershipId);
        if (projectIds !== null) {
            if (projectIds.length === 0) return { rows: [], pagination: emptyPagination(page, limit) };
            whereClause.project_id = { [Op.in]: projectIds };
            whereClause.review_status = { [Op.ne]: 'false' };
        }

        const { count, rows } = await DeliveryRepository.findAndCountAllList(whereClause, organizationId, limit, offset);
        const overall = await DeliveryRepository.countOverview(organizationId);

        return { rows: rows.map(normalizeDelivery), pagination: buildPagination(overall, count, page, limit) };
    },

    fetchOne: async (id: string | undefined, userRole: string | undefined, membershipId: any) => {
        if (!id) return { notFound: true };

        const deliveryData = await DeliveryRepository.findOneDetailed(id);
        const delivery = deliveryData?.dataValues;
        if (!delivery) return { notFound: true };

        if (userRole === 'collaborator') {
            const access = await ProjectMemberRepository.findAccess(delivery.project_id, membershipId);
            if (!access?.dataValues) return { accessDenied: true };
        }

        return { notFound: false, data: delivery };
    },

    search: async (q: string, userRole: string | undefined, membershipId: any, organizationId: any, page: number, limit: number) => {
        if (!q) return { validationError: true };

        const offset = (page - 1) * limit;
        const whereClause: any = {};

        const projectIds = await resolveCollaboratorProjectIds(userRole, membershipId);
        if (projectIds !== null) {
            if (projectIds.length === 0) return { rows: [], pagination: emptyPagination(page, limit) };
            whereClause.project_id = { [Op.in]: projectIds };
        }

        const searchWhere: any = {
            ...whereClause,
            [Op.or]: [
                { '$beneficiary.head_name$': { [Op.like]: `%${q}%` } },
                { '$beneficiary.family_code$': { [Op.like]: `%${q}%` } },
                { notes: { [Op.like]: `%${q}%` } },
            ],
        };

        const { count, rows } = await DeliveryRepository.findAndCountAllSearch(searchWhere, organizationId, limit, offset);
        const overall = await DeliveryRepository.countOverview(organizationId);

        return { rows: rows.map((d: any) => d.toJSON()), pagination: buildPagination(overall, count, page, limit) };
    },

    filter: async (
        userRole: string | undefined,
        membershipId: any,
        organizationId: any,
        reviewStatus: string,
        projectId: number | undefined,
        datePreset: string,
        page: number,
        limit: number
    ) => {
        const offset = (page - 1) * limit;
        const whereClause: any = {};

        if (reviewStatus) whereClause.review_status = reviewStatus;
        if (projectId) whereClause.project_id = projectId;

        const dateFilter = buildDateFilter(datePreset);
        if (dateFilter) whereClause.created_at = dateFilter;

        const projectIds = await resolveCollaboratorProjectIds(userRole, membershipId);
        if (projectIds !== null) {
            if (projectIds.length === 0) return { rows: [], pagination: emptyPagination(page, limit) };
            whereClause.project_id = { [Op.in]: projectIds }; // overrides projectId filter above, same as original
        }

        const { count, rows } = await DeliveryRepository.findAndCountAllFilter(whereClause, organizationId, limit, offset);
        const overall = await DeliveryRepository.countOverview(organizationId);

        return { rows: rows.map((d: any) => d.toJSON()), pagination: buildPagination(overall, count, page, limit) };
    },

    reviewDelivery: async (
        id: string | undefined,
        userRole: string | undefined,
        membershipId: any,
        action: string,
        reviewNote: string | undefined
    ) => {
        if (userRole !== 'collaborator') return { forbidden: true };
        if (!action || (action !== 'approve' && action !== 'reject')) return { invalidAction: true };
        if (action === 'reject' && (!reviewNote || reviewNote.trim() === '')) return { rejectionNoteRequired: true };
        if (!id) return { notFound: true };

        const deliveryData = await DeliveryRepository.findByPk(id);
        const delivery = deliveryData?.dataValues;
        if (!delivery) return { notFound: true };

        const access = await ProjectMemberRepository.findAccess(delivery.project_id, membershipId);
        if (!access?.dataValues) return { accessDenied: true };

        if (delivery.review_status !== 'pending') return { alreadyReviewed: true };

        const action_ = action === 'approve' ? 'approved' : 'rejected';

        await DeliveryRepository.update(deliveryData, {
            review_status: action_,
            reviewed_by_membership_id: membershipId,
            reviewed_at: new Date(),
            review_note: reviewNote?.trim() || null,
            updated_at: new Date(),
        });

        return { notFound: false, data: delivery, action: action_ };
    },

    delete: async (id: string | undefined, status: string) => {
        if (status !== 'rejected') return { invalidStatus: true };
        if (!id) return { notFound: true };

        const deliveryData = await DeliveryRepository.findByPk(id);
        const delivery = deliveryData?.dataValues;
        if (!delivery) return { notFound: true };

        await DeliveryRepository.countItems(delivery.id); // preserved: result unused in original too

        await DeliveryRepository.update(deliveryData, { review_status: 'false' });

        return { notFound: false, data: delivery };
    },
};