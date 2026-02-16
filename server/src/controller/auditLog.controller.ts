import type { Request, Response } from "express";
import ProjectMemberModel from "../models/projectMember.js";
import { Op } from "sequelize";
import AuditLogModel from "../models/AuditLog.js";
import MembershipModel from "../models/Membership.js";
import UserModel from "../models/User.js";

const AuditLogController = {
    fetchAll: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;
        const organisationId = authUser?.organizationId;


        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const whereClause: any = {
                organisation_id: organisationId
            };

            // ROLE-BASED FILTERING
            if (userRole === 'collaborator') {
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
                const enumeratorsUnderCollaborator = await ProjectMemberModel.findAll({
                    where: {
                        project_id: { [Op.in]: projectIds },
                        role_in_project: 'enumerator'
                    },
                    attributes: ['membership_id'],
                    raw: true
                });

                const enumeratorIds = [...new Set(enumeratorsUnderCollaborator.map(pm => pm.membership_id))];

                // Filter: Own actions + enumerators' actions + project-related actions
                whereClause[Op.or] = [
                    { actor_membership_id: membershipId }, // Own actions
                    { actor_membership_id: { [Op.in]: enumeratorIds } }, // Enumerators' actions
                    {
                        entity_type: 'project',
                        entity_id: { [Op.in]: projectIds }
                    }, // Project-related
                    {
                        entity_type: 'beneficiary',
                        metadata: {
                            [Op.or]: projectIds.map(pid => ({
                                [Op.like]: `%"project_id":${pid}%`
                            }))
                        }
                    }, // Beneficiary in their projects
                    {
                        entity_type: 'delivery',
                        metadata: {
                            [Op.or]: projectIds.map(pid => ({
                                [Op.like]: `%"project_id":${pid}%`
                            }))
                        }
                    } // Delivery in their projects
                ];
            }
            // Admin sees everything in their organisation (no additional filter)

            const { count, rows } = await AuditLogModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
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

            const totalPages = Math.ceil(count / limit);

            const auditLogsData = rows.map(log => {
                const data: any = log.dataValues || log;
                return {
                    ...data,
                    actor: data.actor?.dataValues || data.actor
                };
            });

            res.status(200).json({
                type: 'success',
                data: auditLogsData,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("AuditLog: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;
        const organisationId = authUser?.organizationId;

        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 20;
            const offset = (page - 1) * limit;

            if (!q) {
                return res.status(400).json({
                    type: 'error',
                    message: 'search_query_required'
                });
            }

            const whereClause: any = {
                organisation_id: organisationId,
                [Op.or]: [
                    { action: { [Op.like]: `%${q}%` } },
                    { entity_type: { [Op.like]: `%${q}%` } },
                    { ip_address: { [Op.like]: `%${q}%` } }
                ]
            };

            // Apply role-based filtering (same as fetchAll)
            if (userRole === 'collaborator') {
                const collaboratorProjects = await ProjectMemberModel.findAll({
                    where: {
                        membership_id: membershipId,
                        role_in_project: 'collaborator'
                    },
                    attributes: ['project_id'],
                    raw: true
                });

                const projectIds = collaboratorProjects.map(pm => pm.project_id);

                const enumeratorsUnderCollaborator = await ProjectMemberModel.findAll({
                    where: {
                        project_id: { [Op.in]: projectIds },
                        role_in_project: 'enumerator'
                    },
                    attributes: ['membership_id'],
                    raw: true
                });

                const enumeratorIds = [...new Set(enumeratorsUnderCollaborator.map(pm => pm.membership_id))];

                whereClause[Op.and] = [
                    {
                        [Op.or]: [
                            { actor_membership_id: membershipId },
                            { actor_membership_id: { [Op.in]: enumeratorIds } }
                        ]
                    }
                ];
            }

            const { count, rows } = await AuditLogModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: MembershipModel,
                        as: 'actor',
                        include: [{ model: UserModel, as: 'user' }]
                    }
                ],
                limit,
                offset,
                distinct: true
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                type: 'success',
                data: rows.map(log => log.toJSON()),
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("AuditLog: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;
        const organisationId = authUser?.organizationId;

        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 20;
            const offset = (page - 1) * limit;

            const entityType = (req.query.entityType as string)?.trim();
            const actorRole = (req.query.actorRole as string)?.trim();
            const platform = (req.query.platform as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const whereClause: any = {
                organisation_id: organisationId
            };

            if (entityType) whereClause.entity_type = entityType;
            if (actorRole) whereClause.actor_role = actorRole;
            if (platform) whereClause.platform = platform;

            // Date filter
            if (datePreset && datePreset !== "all") {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                whereClause.created_at = {};

                switch (datePreset) {
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

            // Role-based filtering
            if (userRole === 'collaborator') {
                const collaboratorProjects = await ProjectMemberModel.findAll({
                    where: {
                        membership_id: membershipId,
                        role_in_project: 'collaborator'
                    },
                    attributes: ['project_id'],
                    raw: true
                });

                const projectIds = collaboratorProjects.map(pm => pm.project_id);

                const enumeratorsUnderCollaborator = await ProjectMemberModel.findAll({
                    where: {
                        project_id: { [Op.in]: projectIds },
                        role_in_project: 'enumerator'
                    },
                    attributes: ['membership_id'],
                    raw: true
                });

                const enumeratorIds = [...new Set(enumeratorsUnderCollaborator.map(pm => pm.membership_id))];

                whereClause[Op.and] = [
                    {
                        [Op.or]: [
                            { actor_membership_id: membershipId },
                            { actor_membership_id: { [Op.in]: enumeratorIds } }
                        ]
                    }
                ];
            }

            const { count, rows } = await AuditLogModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: MembershipModel,
                        as: 'actor',
                        include: [{ model: UserModel, as: 'user' }]
                    }
                ],
                limit,
                offset,
                distinct: true
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                type: 'success',
                data: rows.map(log => log.toJSON()),
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("AuditLog: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    
}

export default AuditLogController;