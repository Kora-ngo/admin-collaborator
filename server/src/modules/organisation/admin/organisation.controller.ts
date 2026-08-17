import type { Request, Response } from 'express';
import { OrganisationService } from './organisation.service.js';

const OrganisationController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await OrganisationService.fetchAll(page, limit);

            return res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error('Organisation fetchAll error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await OrganisationService.fetchOne(id);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            return res.status(200).json({ type: 'success', data: result.data });
        } catch (error) {
            console.error('Organisation fetchOne error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;

            const status = (req.query.status as string)?.trim();
            const country = (req.query.country as string)?.trim();
            const plan = (req.query.plan as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const result = await OrganisationService.filter(status, country, plan, datePreset, page, limit);

            return res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error('Organisation filter error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;

            const result = await OrganisationService.search(q, page, limit);

            if (result.validationError) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            return res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error('Organisation search error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    toggleStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await OrganisationService.toggleStatus(id);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            return res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error) {
            console.error('Organisation toggleStatus error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    deleteOrganisation: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await OrganisationService.deleteOrganisation(id);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'organisation_not_found' });
            }

            return res.status(200).json({ type: 'success', message: 'organisation_permanently_deleted' });
        } catch (error) {
            console.error('Organisation delete error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default OrganisationController;