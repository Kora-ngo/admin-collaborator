import { type Request, type Response } from 'express';
import { SubscriptionService } from './subscription.service.js';

const SubscriptionController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const organisationId = req.user!.organizationId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await SubscriptionService.fetchAll(organisationId, page, limit);

            if (result.validationError) {
                res.status(400).json({ type: 'error', message: 'organisation_id_required' });
                return;
            }

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Subscription: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchCurrent: async (req: Request, res: Response) => {
        try {
            const organisationId = req.user!.organizationId;

            const result = await SubscriptionService.fetchCurrent(organisationId);

            if (result.validationError) {
                res.status(400).json({ type: 'error', message: 'organisation_id_required' });
                return;
            }
            if (result.notFound) {
                res.status(404).json({ type: 'error', message: 'no_active_subscription' });
                return;
            }

            res.status(200).json({ type: 'success', data: result.data });
        } catch (error) {
            console.error("Subscription: Fetch_Current error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default SubscriptionController;