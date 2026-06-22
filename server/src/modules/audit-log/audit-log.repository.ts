import { Op } from 'sequelize';
import AuditLogModel from './audit-log.model.js';
import MembershipModel from '../membership/membership.model.js';
import UserModel from '../user/user.model.js';
import ProjectMemberModel from '../project-member/project.member.model.js';

export const AuditLogRepository = {

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

    // Helper to get collaborator's visible project & enumerator IDs
    getCollaboratorVisibleIds: async (membershipId: any) => {
        // Get collaborator's projects
        const collaboratorProjects = await ProjectMemberModel.findAll({
            where: {
                membership_id: membershipId,
                role_in_project: 'collaborator'
            },
            attributes: ['project_id'],
            raw: true
        });

        const projectIds = collaboratorProjects.map(pm => pm.project_id);

        // Get enumerators under this collaborator
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