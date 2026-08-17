import { type Request, type Response } from 'express';
import { AnalyticsService } from './analytics.service.js';

const AnalyticsController = {

    fetch: async (req: Request, res: Response) => {
        try {
            const project = (req.query.project as string) || 'all';
            const period = (req.query.period as string) || 'last_30_days';
            const region = (req.query.region as string) || 'all';

            const result = await AnalyticsService.getAnalytics(
                req.user!.role, req.user!.membershipId, req.user!.organizationId!,
                project, period, region
            );

            res.status(200).json({ type: 'success', data: result });
        } catch (error) {
            console.error('Analytics: Fetch error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filters: async (req: Request, res: Response) => {
        try {
            const result = await AnalyticsService.getFilters(req.user!.organizationId!);
            res.status(200).json({ type: 'success', data: result });
        } catch (error) {
            console.error('Analytics: Filters error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    export: async (req: Request, res: Response) => {
        try {
            // TODO: reuse shared/utils/csvGenerator.ts to export the currently
            // filtered analytics dataset. Left as a stub until the JSON shape
            // above is confirmed against the frontend.
            res.status(501).json({ type: 'error', message: 'not_implemented' });
        } catch (error) {
            console.error('Analytics: Export error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default AnalyticsController;