import { type Request, type Response } from 'express';

import type { AssistanceCreationAttributes, AssistanceTypeAttributes } from './types/assistance.js';
import { AssistanceService, AssistanceTypeService } from './assistance.service.js';

const AssistanceController = {


    // ============================================================
    // Assistance
    // ============================================================

    fetchAll: async (req: Request, res: Response) => {
        try {
            const status = req.query.status as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;

            console.info("Status ----> ", status);

            const result = await AssistanceService.fetchAll(req.user?.organizationId, status, page, limit);

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Assistance: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const assistance = await AssistanceService.fetchOne(id);

            if (!assistance) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }

            res.status(200).json({ type: 'success', data: assistance });
        } catch (error) {
            console.error("Assistance: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const body: AssistanceCreationAttributes = req.body;
            const organisationId = req.user?.organizationId;

            if (!body.name || !body.assistance_id || !body.created_by) {
                res.status(400).json({ type: 'error', message: 'feilds_required' });
                return;
            }

            const result = await AssistanceService.create(body, organisationId);

            if (result.conflict) {
                res.status(409).json({ type: 'error', message: 'record_already_exists' });
                return;
            }

            res.status(201).json({ type: 'success', message: 'done', data: result.data });
        } catch (error: any) {
            console.error("Assistance: Create error:", error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(409).json({ type: 'error', message: 'uid_already_exists' });
                return;
            }
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: AssistanceCreationAttributes = req.body;

            if (updates.name === '' || (updates.description === '' && updates.description !== undefined)) {
                res.status(400).json({ type: 'error', message: 'feilds_required' });
                return;
            }

            const result = await AssistanceService.update(id, updates);

            if (result.notFound) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }

            res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error: any) {
            console.error("Assistance: Update error:", error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(409).json({ type: 'error', message: 'uid_already_exists' });
                return;
            }
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    toggleStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await AssistanceService.toggleStatus(id);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error) {
            console.error("Assistance: Toggle Status error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;

            if (!q) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            const result = await AssistanceService.search(req.user?.organizationId, q, page, limit);

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Assistance: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;
            const status = (req.query.status as string)?.trim();
            const typeId = req.query.typeId ? parseInt(req.query.typeId as string) : undefined;
            const datePreset = (req.query.datePreset as string)?.trim();

            const result = await AssistanceService.filter(req.user?.organizationId, status, typeId, datePreset, page, limit);

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Assistance: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    // ============================================================
    // Assistance Type
    // ============================================================

    fetchAllType: async (req: Request, res: Response) => {
        try {
            const type = await AssistanceTypeService.fetchAll(req.user?.organizationId);
            res.status(200).json({ type: 'success', data: type });
        } catch (error) {
            console.error("Assistant Type: Fetch_All_Type error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOneType: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const type = await AssistanceTypeService.fetchOne(id);

            if (!type) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }

            res.status(200).json({ type: 'success', data: type });
        } catch (error) {
            console.error("Assistant Type: Fetch_One_Type error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    createType: async (req: Request, res: Response) => {
        try {
            const input = req.body;
            const organizationId = req.user?.organizationId;

            if (!organizationId) {
                return res.status(403).json({ type: 'error', message: 'organization_not_found' });
            }

            const result = await AssistanceTypeService.create(input, organizationId);

            if (result.empty) {
                return res.status(400).json({ type: 'error', message: 'no_data_provided' });
            }

            if (result.validationErrors) {
                return res.status(400).json({ type: 'error', message: 'validation_failed', details: result.validationErrors });
            }

            if (result.conflicts) {
                return res.status(409).json({ type: 'error', message: 'duplicate_records', details: result.conflicts });
            }

            res.status(201).json({ type: 'success', message: 'done', data: result.data, count: result.data!.length });
        } catch (error) {
            console.error("Assistant Type: Create_Type error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    updateType: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates: AssistanceTypeAttributes = req.body;

            if (updates.name === '' || updates.unit === '') {
                res.status(400).json({ type: 'error', message: 'feilds_required' });
                return;
            }

            const result = await AssistanceTypeService.update(id, updates);

            if (result.notFound) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }

            res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error: any) {
            console.error('Error updating assistance type:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(409).json({ type: 'error', message: 'An assistance type with this name already exists' });
                return;
            }
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    deleteType: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await AssistanceTypeService.delete(id);

            if (result.notFound) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }

            res.status(200).json({ type: 'success', message: 'done' });
        } catch (error: any) {
            console.error('Error deleting assistance type:', error);
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                res.status(409).json({ type: 'error', message: 'Cannot delete: This type is being used by existing assistances' });
                return;
            }
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default AssistanceController;