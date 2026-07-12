import { type Request, type Response } from 'express';
import { ProjectService } from './project.service.js';

const ProjectController = {

    create: async (req: Request, res: Response) => {
        try {
            const result = await ProjectService.create(req.body, req.user?.membershipId);

            if (result.validationError) {
                return res.status(400).json({ type: 'error', message: result.validationError });
            }
            if (result.conflict) {
                return res.status(409).json({ type: 'error', message: 'record_already_exists' });
            }

            res.status(201).json({ type: 'success', message: 'done', data: result.data });
        } catch (error: any) {
            console.error("Project: Create error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;

            const result = await ProjectService.fetchAll(
                req.user!.role, req.user!.membershipId, req.user?.organizationId, page, limit
            );

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Project: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await ProjectService.fetchOne(id);

            if (result.notFound) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }

            res.status(200).json({ type: 'success', data: result.data });
        } catch (error) {
            // NOTE: preserved from original — this catch block doesn't log the error.
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await ProjectService.update(id, req.body, req.user?.membershipId);

            if (result.notFound) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }
            if (result.validationError) {
                res.status(400).json({ type: 'error', message: result.validationError });
                return;
            }

            res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error: any) {
            console.error("Project: Update error:", error.message);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    canDelete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await ProjectService.canDelete(id!);

            res.status(200).json({ type: 'success', data: result });
        } catch (error) {
            console.error("Project: Can Delete check error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    toggleStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await ProjectService.toggleStatus(id);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error) {
            console.error("Project: Toggle Status error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;

            const result = await ProjectService.search(
                q, req.user!.role, req.user!.membershipId, req.user?.organizationId, page, limit
            );

            if (result.validationError) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Project: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;
            const status = (req.query.status as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const result = await ProjectService.filter(
                req.user!.role, req.user!.membershipId, req.user?.organizationId, status, datePreset, page, limit
            );

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Project: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default ProjectController;