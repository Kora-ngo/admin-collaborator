import { Op } from 'sequelize';
import { AdminProjectRepository } from './project.repository.js';

const buildPagination = (count: number, page: number, limit: number) => {
    const totalPages = Math.ceil(count / limit);
    return { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};

const VALID_STATUSES = ['pending', 'ongoing', 'done', 'suspended', 'overdue', 'false'];

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

export const AdminProjectService = {

    fetchAll: async (page: number, limit: number) => {
        const offset = (page - 1) * limit;
        const { count, rows } = await AdminProjectRepository.findAndCountAllList(limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },

    fetchOne: async (id: string | undefined) => {
        if (!id) return { notFound: true };
        const project = await AdminProjectRepository.findByPkDetailed(id);
        if (!project) return { notFound: true };
        return { notFound: false, data: project };
    },

    search: async (q: string, page: number, limit: number) => {
        if (!q) return { validationError: true };

        const offset = (page - 1) * limit;
        const { count, rows } = await AdminProjectRepository.findAndCountAllSearch(q, limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },

    filter: async (status: string, datePreset: string, page: number, limit: number) => {
        const offset = (page - 1) * limit;
        const where: any = {};

        if (status && VALID_STATUSES.includes(status)) {
            where.status = status;
        }

        const dateFilter = buildDateFilter(datePreset);
        if (dateFilter) where.created_at = dateFilter;

        const { count, rows } = await AdminProjectRepository.findAndCountAllFilter(where, limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },
};