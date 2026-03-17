import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { OrganisationModel } from '../../models/index.js';
import SubscriptionModel from '../../models/Subscription.js';
import sequelize from 'sequelize/lib/sequelize';
import { generateUniqueUid } from '../../utils/generateUniqueUid.js';

// Shared include
const subIncludes = [
    {
        model: OrganisationModel,
        as: 'organisation',
        attributes: ['id', 'name', 'email', 'phone'],
    },
];

const SubscriptionController = {

    // One row per org — latest subscription
    fetchAll: async (req: Request, res: Response) => {
        try {
            const page   = parseInt(req.query.page  as string) || 1;
            const limit  = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            // Get latest subscription id per organisation via subquery
            const latestIds = await SubscriptionModel.findAll({
                attributes: [
                    [sequelize.fn('MAX', sequelize.col('id')), 'max_id']
                ],
                group: ['organization_id'],
                raw: true,
            }) as any[];

            const ids = latestIds.map((r) => r.max_id);

            const { count, rows } = await SubscriptionModel.findAndCountAll({
                where: { id: { [Op.in]: ids } },
                order: [['started_at', 'DESC']],
                include: subIncludes,
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
            console.error('Subscription fetchAll error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // All subscriptions for one org (for the listing tab in modal)
    fetchByOrg: async (req: Request, res: Response) => {
        try {
            const { orgId } = req.params;

            const rows = await SubscriptionModel.findAll({
                where: { organization_id: orgId },
                order: [['started_at', 'DESC']],
                attributes: ['id', 'uid', 'plan', 'started_at', 'ends_at', 'status'],
            });

            return res.status(200).json({ type: 'success', data: rows });
        } catch (error) {
            console.error('Subscription fetchByOrg error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page   = parseInt(req.query.page as string) || 1;
            const limit  = 10;
            const offset = (page - 1) * limit;
            const status = (req.query.status as string)?.trim();
            const plan   = (req.query.plan   as string)?.trim();

            const where: any = {};

            if (status && ['active', 'expired', 'cancelled'].includes(status)) {
                where.status = status;
            }

            if (plan && ['free', 'pro', 'enterprise'].includes(plan)) {
                where.plan = plan;
            }

            // Still only latest per org
            const latestIds = await SubscriptionModel.findAll({
                attributes: [[sequelize.fn('MAX', sequelize.col('id')), 'max_id']],
                group: ['organization_id'],
                raw: true,
            }) as any[];

            const ids = latestIds.map((r) => r.max_id);
            where.id = { [Op.in]: ids };

            const { count, rows } = await SubscriptionModel.findAndCountAll({
                where,
                order: [['started_at', 'DESC']],
                include: subIncludes,
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
            console.error('Subscription filter error:', error);
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

            // Search by org name — get matching org ids first
            const matchingOrgs = await OrganisationModel.findAll({
                where: { name: { [Op.like]: `%${q}%` } },
                attributes: ['id'],
                raw: true,
            }) as any[];

            const orgIds = matchingOrgs.map((o) => o.id);

            // Latest subscription per matching org
            const latestIds = await SubscriptionModel.findAll({
                attributes: [[sequelize.fn('MAX', sequelize.col('id')), 'max_id']],
                where: { organization_id: { [Op.in]: orgIds } },
                group: ['organization_id'],
                raw: true,
            }) as any[];

            const ids = latestIds.map((r) => r.max_id);

            const { count, rows } = await SubscriptionModel.findAndCountAll({
                where: { id: { [Op.in]: ids } },
                order: [['started_at', 'DESC']],
                include: subIncludes,
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
            console.error('Subscription search error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const { organization_id, plan, duration_days } = req.body;

            if (!organization_id || !plan || !duration_days) {
                return res.status(400).json({ type: 'error', message: 'fields_required' });
            }

            const validPlans = ['free', 'pro', 'enterprise'];
            if (!validPlans.includes(plan)) {
                return res.status(400).json({ type: 'error', message: 'invalid_plan' });
            }

            const org = await OrganisationModel.findByPk(organization_id);
            if (!org) {
                return res.status(404).json({ type: 'error', message: 'organisation_not_found' });
            }

            const started_at = new Date();
            const ends_at    = new Date();
            ends_at.setDate(started_at.getDate() + parseInt(duration_days));

            const uid = await generateUniqueUid('subscription');

            const subscription = await SubscriptionModel.create({
                uid,
                organization_id,
                plan,
                started_at,
                ends_at,
                status: 'true',
            });

            return res.status(201).json({
                type: 'success',
                message: 'done',
                data: subscription,
            });
        } catch (error) {
            console.error('Subscription create error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default SubscriptionController;