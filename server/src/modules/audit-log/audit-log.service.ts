import { Op } from 'sequelize';
import { AuditLogRepository } from './audit-log.repository.js';

export const AuditLogService = {

    fetchAll: async (authUser: any, page = 1, limit = 20) => {
        const organisationId = authUser?.organizationId;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        const offset = (page - 1) * limit;

        const whereClause: any = {
            organisation_id: organisationId
        };

        if (userRole === 'collaborator') {
            const { projectIds, enumeratorIds } = await AuditLogRepository.getCollaboratorVisibleIds(membershipId);

            whereClause[Op.or] = [
                { actor_membership_id: membershipId },
                { actor_membership_id: { [Op.in]: enumeratorIds } },
                {
                    entity_type: 'project',
                    entity_id: { [Op.in]: projectIds }
                },
                {
                    entity_type: 'beneficiary',
                    metadata: { [Op.or]: projectIds.map(pid => ({ [Op.like]: `%"project_id":${pid}%` })) }
                },
                {
                    entity_type: 'delivery',
                    metadata: { [Op.or]: projectIds.map(pid => ({ [Op.like]: `%"project_id":${pid}%` })) }
                }
            ];
        }

        const { count, rows } = await AuditLogRepository.findTodayActivity(whereClause, limit, offset);

        const totalPages = Math.ceil(count / limit);

        return {
            rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    },

    search: async (authUser: any, q: string, page = 1, limit = 20) => {
        const organisationId = authUser?.organizationId;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        const offset = (page - 1) * limit;

        const whereClause: any = {
            organisation_id: organisationId,
            [Op.or]: [
                { action: { [Op.like]: `%${q}%` } },
                { entity_type: { [Op.like]: `%${q}%` } },
                { ip_address: { [Op.like]: `%${q}%` } }
            ]
        };

        if (userRole === 'collaborator') {
            const { projectIds, enumeratorIds } = await AuditLogRepository.getCollaboratorVisibleIds(membershipId);

            whereClause[Op.and] = [
                {
                    [Op.or]: [
                        { actor_membership_id: membershipId },
                        { actor_membership_id: { [Op.in]: enumeratorIds } }
                    ]
                }
            ];
        }

        const { count, rows } = await AuditLogRepository.findAndCountAll(whereClause, limit, offset);

        const totalPages = Math.ceil(count / limit);

        return {
            rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    },

    filter: async (authUser: any, filters: any, page = 1, limit = 20) => {
        const organisationId = authUser?.organizationId;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        const offset = (page - 1) * limit;

        const whereClause: any = {
            organisation_id: organisationId
        };

        if (filters.entityType) whereClause.entity_type = filters.entityType;
        if (filters.actorRole) whereClause.actor_role = filters.actorRole;
        if (filters.platform) whereClause.platform = filters.platform;

        // Date Preset
        if (filters.datePreset && filters.datePreset !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            whereClause.created_at = {};

            switch (filters.datePreset) {
                case "today":
                    whereClause.created_at[Op.gte] = today;
                    whereClause.created_at[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case "this_week":
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    whereClause.created_at[Op.gte] = weekStart;
                    break;
                case "this_month":
                    whereClause.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case "this_year":
                    whereClause.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
                    break;
            }
        }

        if (userRole === 'collaborator') {
            const { projectIds, enumeratorIds } = await AuditLogRepository.getCollaboratorVisibleIds(membershipId);

            whereClause[Op.and] = [
                {
                    [Op.or]: [
                        { actor_membership_id: membershipId },
                        { actor_membership_id: { [Op.in]: enumeratorIds } }
                    ]
                }
            ];
        }

        const { count, rows } = await AuditLogRepository.findAndCountAll(whereClause, limit, offset);

        const totalPages = Math.ceil(count / limit);

        return {
            rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }
};