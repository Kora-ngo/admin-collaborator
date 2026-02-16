import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import SubscriptionModel from '../models/Subscription.js';

const SubscriptionController = {
    
    // Get all subscriptions for an organization (with pagination)
    fetchAll: async (req: Request, res: Response) => {
        try {
            const organisationId = req.user!.organizationId;

            if (!organisationId) {
                res.status(400).json({
                    type: 'error',
                    message: 'organisation_id_required'
                });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            // Get all subscriptions for the organization, ordered by start date (newest first)
            const { count, rows } = await SubscriptionModel.findAndCountAll({
                where: {
                    organization_id: organisationId
                },
                order: [['started_at', 'DESC']],
                limit,
                offset,
                distinct: true
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                type: 'success',
                data: rows,
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
            console.error("Subscription: Fetch_All error:", error);
            res.status(500).json({ 
                type: 'error', 
                message: 'server_error' 
            });
        }
    },

    // Get current active subscription
    fetchCurrent: async (req: Request, res: Response) => {
        try {
            const organisationId = req.user!.organizationId;

            if (!organisationId) {
                res.status(400).json({
                    type: 'error',
                    message: 'organisation_id_required'
                });
                return;
            }

            // Get the most recent active subscription
            const currentSubscription = await SubscriptionModel.findOne({
                where: {
                    organization_id: organisationId,
                    status: 'true', // or whatever your active status value is
                    ends_at: {
                        [Op.gte]: new Date() // Not yet expired
                    }
                },
                order: [['started_at', 'DESC']]
            });

            if (!currentSubscription) {
                res.status(404).json({
                    type: 'error',
                    message: 'no_active_subscription'
                });
                return;
            }

            res.status(200).json({
                type: 'success',
                data: currentSubscription
            });

        } catch (error) {
            console.error("Subscription: Fetch_Current error:", error);
            res.status(500).json({ 
                type: 'error', 
                message: 'server_error' 
            });
        }
    }
};

export default SubscriptionController;