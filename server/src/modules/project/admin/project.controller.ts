import type { Request, Response } from 'express';
import { AdminProjectService } from './project.service.js';

const ProjectController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await AdminProjectService.fetchAll(page, limit);

            return res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error('Project fetchAll error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await AdminProjectService.fetchOne(id);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            return res.status(200).json({ type: 'success', data: result.data });
        } catch (error) {
            console.error('Project fetchOne error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;

            const result = await AdminProjectService.search(q, page, limit);

            if (result.validationError) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            return res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error('Project search error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const status = (req.query.status as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const result = await AdminProjectService.filter(status, datePreset, page, limit);

            return res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error('Project filter error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default ProjectController;