import { Op } from 'sequelize';
import AuditLogModel from './audit-log.model.js';
import MembershipModel from '../membership/membership.model.js';
import UserModel from '../user/user.model.js';
import ProjectMemberModel from '../project-member/project.member.model.js';

// Returns the [start, end) boundaries of "today" in server-local time.
const getTodayRange = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    return { startOfDay, endOfDay };
};

export const AuditLogRepository = {

    countOverview: async (organisationId: number) => {
        const total = await AuditLogModel.count({ where: { organisation_id: organisationId } });
        return total;
    },

    findAndCountAll: async (where: any, limit: number, offset: number, includeOptions?: any) => {
        return AuditLogModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: includeOptions || [
                {
                    model: MembershipModel,
                    as: 'actor',
                    attributes: ['id', 'role'],
                    include: [
                        {
                            model: UserModel,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            limit,
            offset,
            distinct: true
        });
    },

    // Same as findAndCountAll, but scoped to today's activity only.
    // Merges created_at into whatever where clause the caller already built
    // (organisation_id, entity_type, etc.) rather than requiring callers to
    // remember to add the date filter themselves.
    findTodayActivity: async (where: any, limit: number, offset: number, includeOptions?: any) => {
        const { startOfDay, endOfDay } = getTodayRange();

        return AuditLogModel.findAndCountAll({
            where: {
                ...where,
                created_at: { [Op.gte]: startOfDay, [Op.lt]: endOfDay },
            },
            order: [['created_at', 'DESC']],
            include: includeOptions || [
                {
                    model: MembershipModel,
                    as: 'actor',
                    attributes: ['id', 'role'],
                    include: [
                        {
                            model: UserModel,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            limit,
            offset,
            distinct: true
        });
    },

    // Helper to get collaborator's visible project & enumerator IDs
    getCollaboratorVisibleIds: async (membershipId: any) => {
        const collaboratorProjects = await ProjectMemberModel.findAll({
            where: {
                membership_id: membershipId,
                role_in_project: 'collaborator'
            },
            attributes: ['project_id'],
            raw: true
        });

        const projectIds = collaboratorProjects.map(pm => pm.project_id);

        const enumerators = await ProjectMemberModel.findAll({
            where: {
                project_id: { [Op.in]: projectIds },
                role_in_project: 'enumerator'
            },
            attributes: ['membership_id'],
            raw: true
        });

        const enumeratorIds = [...new Set(enumerators.map(pm => pm.membership_id))];

        return { projectIds, enumeratorIds };
    }
};