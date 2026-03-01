import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { AuditLogModel, MembershipModel, OrganisationModel, UserModel } from '../../models/index.js';
import sequelize from 'sequelize/lib/sequelize';

// Shared include — used across all methods
const auditIncludes = [
    {
        model: MembershipModel,
        as: 'actor',
        attributes: ['id', 'role'],
        include: [{
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email'],
        }],
    },
    {
        model: OrganisationModel,
        as: 'organisation',
        attributes: ['id', 'name'],
    },
];

const AuditLogController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page   = parseInt(req.query.page  as string) || 1;
            const limit  = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await AuditLogModel.findAndCountAll({
                order: [['created_at', 'DESC']],
                include: auditIncludes,
                limit,
                offset,
                distinct: true,
            });

            const totalPages = Math.ceil(count / limit);

            return res.status(200).json({
                type: 'success',
                data: rows,
                pagination: {
                    total: count, page, limit, totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });
        } catch (error) {
            console.error('AuditLog fetchAll error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q      = (req.query.q as string)?.trim();
            const page   = parseInt(req.query.page as string) || 1;
            const limit  = 10;
            const offset = (page - 1) * limit;

            if (!q) return res.status(400).json({ type: 'error', message: 'search_query_required' });

            // Search by action directly, OR by actor name via subquery
            const { count, rows } = await AuditLogModel.findAndCountAll({
                where: {
                    [Op.or]: [
                        { action: { [Op.like]: `%${q}%` } },
                        {
                            actor_membership_id: {
                                [Op.in]: sequelize.literal(`(
                                    SELECT m.id FROM membership m
                                    INNER JOIN users u ON u.id = m.user_id
                                    WHERE u.name LIKE '%${q.replace(/'/g, "''")}%'
                                )`)
                            }
                        }
                    ]
                },
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: MembershipModel,
                        as: 'actor',
                        attributes: ['id', 'role'],
                        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
                    },
                    { model: OrganisationModel, as: 'organisation', attributes: ['id', 'name'] },
                ],
                limit, offset, distinct: true,
            });

            const totalPages = Math.ceil(count / limit);
            return res.status(200).json({
                type: 'success', data: rows,
                pagination: { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
            });
        } catch (error) {
            console.error('AuditLog search error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page           = parseInt(req.query.page as string) || 1;
            const limit          = 10;
            const offset         = (page - 1) * limit;
            const entityType     = (req.query.entityType  as string)?.trim();
            const actorRole      = (req.query.actorRole   as string)?.trim();
            const platform       = (req.query.platform    as string)?.trim();
            const datePreset     = (req.query.datePreset  as string)?.trim();
            const organisationId = req.query.organisationId ? parseInt(req.query.organisationId as string) : undefined;

            const where: any = {};

            const validEntityTypes = ['auth', 'beneficiary', 'delivery', 'project', 'user', 'sync'];
            if (entityType && validEntityTypes.includes(entityType)) {
                where.entity_type = entityType;
            }

            const validRoles = ['admin', 'collaborator', 'enumerator'];
            if (actorRole && validRoles.includes(actorRole)) {
                where.actor_role = actorRole;
            }

            if (platform && ['web', 'mobile'].includes(platform)) {
                where.platform = platform;
            }

            if (organisationId && organisationId > 0) {
                where.organisation_id = organisationId;
            }

            if (datePreset && datePreset !== 'all') {
                const now   = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                where.created_at = {};

                switch (datePreset) {
                    case 'today':
                        where.created_at[Op.gte] = today;
                        where.created_at[Op.lt]  = new Date(today.getTime() + 86400000);
                        break;
                    case 'this_week':
                        const w = new Date(today);
                        w.setDate(today.getDate() - today.getDay());
                        where.created_at[Op.gte] = w;
                        break;
                    case 'this_month':
                        where.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'this_year':
                        where.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            }

            const { count, rows } = await AuditLogModel.findAndCountAll({
                where,
                order: [['created_at', 'DESC']],
                include: auditIncludes,
                limit,
                offset,
                distinct: true,
            });

            const totalPages = Math.ceil(count / limit);

            return res.status(200).json({
                type: 'success',
                data: rows,
                pagination: {
                    total: count, page, limit, totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });
        } catch (error) {
            console.error('AuditLog filter error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default AuditLogController;