import { type Request, type Response } from 'express';
import { DashboardService } from './dashboard.service.js';

const DashboardController = {

    // ============================================================
    // Admin — single consolidated dashboard payload
    // ============================================================
    adminDashboard: async (req: Request, res: Response) => {
        try {
            const organisationId = req.user?.organizationId;
            if (!organisationId) {
                return res.status(400).json({ type: 'error', message: 'organisation_id_required' });
            }

            const data = await DashboardService.getAdminDashboard(organisationId);
            res.status(200).json({ type: 'success', data });
        } catch (error) {
            console.error('Dashboard: adminDashboard error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // ============================================================
    // Collaborator
    // ============================================================

    collaboratorKeyMetrics: async (req: Request, res: Response) => {
        try {
            const authUser = req.user;
            if (!authUser?.membershipId) return res.status(401).json({ type: 'error', message: 'unauthorized' });

            const data = await DashboardService.getCollaboratorKeyMetrics(authUser.membershipId, authUser.organizationId!);
            res.status(200).json({ type: 'success', data });
        } catch (error) {
            console.error('Dashboard: collaboratorKeyMetrics error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    collaboratorEnumeratorActivity: async (req: Request, res: Response) => {
        try {
            const authUser = req.user;
            if (!authUser?.membershipId) return res.status(401).json({ type: 'error', message: 'unauthorized' });

            const data = await DashboardService.getCollaboratorEnumeratorActivity(authUser.membershipId);
            res.status(200).json({ type: 'success', data });
        } catch (error) {
            console.error('Dashboard: collaboratorEnumeratorActivity error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    collaboratorValidationQueue: async (req: Request, res: Response) => {
        try {
            const authUser = req.user;
            if (!authUser?.membershipId) return res.status(401).json({ type: 'error', message: 'unauthorized' });

            const data = await DashboardService.getCollaboratorValidationQueue(authUser.membershipId);
            res.status(200).json({ type: 'success', data });
        } catch (error) {
            console.error('Dashboard: collaboratorValidationQueue error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default DashboardController;