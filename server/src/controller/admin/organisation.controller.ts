import type { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { OrganisationModel, UserModel, MembershipModel, ProjectModel, AssistanceModel } from '../../models/index.js';
import SubscriptionModel from '../../models/Subscription.js';

const OrganisationController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page  = parseInt(req.query.page  as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await OrganisationModel.findAndCountAll({
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                        foreignKey: 'created_by',
                    },
                    {
                        model: MembershipModel,
                        as: 'memberships',
                        attributes: ['id', 'role'],
                    },
                    {
                        model: ProjectModel,
                        as: 'projects',
                        attributes: ['id'],
                    },
                    {
                        model: AssistanceModel,
                        as: 'assistances',
                        attributes: ['id'],
                    },
                    {
                        model: SubscriptionModel,
                        as: 'subscription',
                        attributes: ['plan', 'status', 'ends_at'],
                        required: false,
                    }
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
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error('Organisation fetchAll error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const organisation = await OrganisationModel.findByPk(id, {
                include: [
                    {
                        model: UserModel,
                        as: 'owner',
                        attributes: ['id', 'name', 'email', 'phone'],
                        foreignKey: 'created_by',
                    },
                    {
                        model: MembershipModel,
                        as: 'memberships',
                        attributes: ['id', 'role', 'status', 'date_of'],
                    },
                    {
                        model: SubscriptionModel,
                        as: 'subscription',
                        attributes: ['plan', 'status', 'started_at', 'ends_at'],
                        required: false,
                    }
                ],
            });

            if (!organisation) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            return res.status(200).json({ type: 'success', data: organisation });

        } catch (error) {
            console.error('Organisation fetchOne error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page   = parseInt(req.query.page as string) || 1;
            const limit  = 10;
            const offset = (page - 1) * limit;

            const status     = (req.query.status     as string)?.trim();
            const country    = (req.query.country    as string)?.trim();
            const plan       = (req.query.plan       as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const where: any = {};

            if (status === 'true' || status === 'false') {
                where.status = status;
            }

            if (country) {
                where.country = country;
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

            // Subscription plan filter (nested where)
            const subscriptionWhere: any = {};
            if (plan && plan !== 'all') {
                subscriptionWhere.plan = plan;
            }

            const { count, rows } = await OrganisationModel.findAndCountAll({
                where,
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                        foreignKey: 'created_by',
                    },
                    {
                        model: MembershipModel,
                        as: 'memberships',
                        attributes: ['id', 'role'],
                    },
                    {
                        model: ProjectModel,
                        as: 'projects',
                        attributes: ['id'],
                    },
                    {
                        model: AssistanceModel,
                        as: 'assistances',
                        attributes: ['id'],
                    },
                    {
                        model: SubscriptionModel,
                        as: 'subscription',
                        attributes: ['plan', 'status', 'ends_at'],
                        required: Object.keys(subscriptionWhere).length > 0,
                        where: Object.keys(subscriptionWhere).length > 0 ? subscriptionWhere : undefined,
                    }
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
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error('Organisation filter error:', error);
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

            const { count, rows } = await OrganisationModel.findAndCountAll({
                where: {
                    name: { [Op.like]: `%${q}%` },
                },
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                        foreignKey: 'created_by',
                    },
                    {
                        model: MembershipModel,
                        as: 'memberships',
                        attributes: ['id', 'role'],
                    },
                    {
                        model: ProjectModel,
                        as: 'projects',
                        attributes: ['id'],
                    },
                    {
                        model: AssistanceModel,
                        as: 'assistances',
                        attributes: ['id'],
                    },
                    {
                        model: SubscriptionModel,
                        as: 'subscription',
                        attributes: ['plan', 'status', 'ends_at'],
                        required: false,
                    }
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
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error('Organisation search error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    toggleStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const organisation = await OrganisationModel.findByPk(id);

            if (!organisation) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            const newStatus = organisation.dataValues.status === 'true' ? 'blocked' : 'true';

            await organisation.update({ status: newStatus, update_of: new Date() });

            return res.status(200).json({
                type: 'success',
                message: 'done',
                data: { id: organisation.id, status: newStatus },
            });

        } catch (error) {
            console.error('Organisation toggleStatus error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default OrganisationController;