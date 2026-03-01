import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import MembershipModel from '../../models/Membership.js';
import OrganisationModel from '../../models/Organisation.js';
import UserModel from '../../models/User.js';


const MembershipController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page   = parseInt(req.query.page  as string) || 1;
            const limit  = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await MembershipModel.findAndCountAll({
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone'],
                    },
                    {
                        model: OrganisationModel,
                        as: 'organization',
                        attributes: ['id', 'name'],
                    },
                ],
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
            console.error('Membership fetchAll error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const membership = await MembershipModel.findByPk(id, {
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'uid', 'name', 'email', 'phone', 'status', 'date_of'],
                    },
                    {
                        model: OrganisationModel,
                        as: 'organization',
                        attributes: ['id', 'name', 'email', 'country', 'status'],
                    },
                ],
            });

            if (!membership) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            return res.status(200).json({ type: 'success', data: membership });
        } catch (error) {
            console.error('Membership fetchOne error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q      = (req.query.q as string)?.trim();
            const page   = parseInt(req.query.page as string) || 1;
            const limit  = 10;
            const offset = (page - 1) * limit;

            if (!q) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            const { count, rows } = await MembershipModel.findAndCountAll({
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone'],
                        where: {
                            [Op.or]: [
                                { name:  { [Op.like]: `%${q}%` } },
                                { email: { [Op.like]: `%${q}%` } },
                            ],
                        },
                    },
                    {
                        model: OrganisationModel,
                        as: 'organization',
                        attributes: ['id', 'name'],
                    },
                ],
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
            console.error('Membership search error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page       = parseInt(req.query.page as string) || 1;
            const limit      = 10;
            const offset     = (page - 1) * limit;
            const status     = (req.query.status     as string)?.trim();
            const role       = (req.query.role       as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const where: any = {};

            if (status && ['true', 'false', 'blocked'].includes(status)) {
                where.status = status;
            }

            if (role && ['admin', 'collaborator', 'enumerator'].includes(role)) {
                where.role = role;
            }

            if (datePreset && datePreset !== 'all') {
                const now   = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                where.date_of = {};

                switch (datePreset) {
                    case 'today':
                        where.date_of[Op.gte] = today;
                        where.date_of[Op.lt]  = new Date(today.getTime() + 86400000);
                        break;
                    case 'this_week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        where.date_of[Op.gte] = weekStart;
                        break;
                    case 'this_month':
                        where.date_of[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'this_year':
                        where.date_of[Op.gte] = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            }

            const { count, rows } = await MembershipModel.findAndCountAll({
                where,
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone'],
                    },
                    {
                        model: OrganisationModel,
                        as: 'organization',
                        attributes: ['id', 'name'],
                    },
                ],
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
            console.error('Membership filter error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    blockMembership: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const membership = await MembershipModel.findByPk(id);

            if (!membership) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }
            if (membership.status === 'blocked') {
                return res.status(409).json({ type: 'warning', message: 'already_blocked' });
            }

            await membership.update({ status: 'blocked' });

            return res.status(200).json({ type: 'success', message: 'done', data: { id: membership.id, status: 'blocked' } });
        } catch (error) {
            console.error('Membership block error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    deleteMembership: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const membership = await MembershipModel.findByPk(id);

            if (!membership) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }
            if (membership.role === 'admin') {
                return res.status(403).json({ type: 'error', message: 'cannot_delete_admin' });
            }
            if (membership.status === 'false') {
                return res.status(409).json({ type: 'warning', message: 'already_deleted' });
            }

            await membership.update({ status: 'false' });

            return res.status(200).json({ type: 'success', message: 'done', data: { id: membership.id, status: 'false' } });
        } catch (error) {
            console.error('Membership delete error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    restoreMembership: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const membership = await MembershipModel.findByPk(id);

            if (!membership) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }
            if (membership.status === 'true') {
                return res.status(409).json({ type: 'warning', message: 'already_active' });
            }

            await membership.update({ status: 'true' });

            return res.status(200).json({ type: 'success', message: 'done', data: { id: membership.id, status: 'true' } });
        } catch (error) {
            console.error('Membership restore error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default MembershipController;