import type { Request, Response } from 'express';
import { logAudit } from '../../shared/utils/auditLogger.js';
import { DeliveryService } from './delivery.service.js';

const DeliveryController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await DeliveryService.fetchAll(
                req.user?.role, req.user?.membershipId, req.user?.organizationId, page, limit
            );

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Delivery: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await DeliveryService.fetchOne(id, req.user?.role, req.user?.membershipId);

            if (result.notFound) return res.status(404).json({ type: 'error', message: 'record_not_found' });
            if (result.accessDenied) return res.status(403).json({ type: 'error', message: 'access_denied' });

            res.status(200).json({ type: 'success', data: result.data });
        } catch (error) {
            console.error("Delivery: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;

            const result = await DeliveryService.search(
                q, req.user?.role, req.user?.membershipId, req.user?.organizationId, page, limit
            );

            if (result.validationError) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Delivery: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const reviewStatus = (req.query.reviewStatus as string)?.trim();
            const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
            const datePreset = (req.query.datePreset as string)?.trim();

            const result = await DeliveryService.filter(
                req.user?.role, req.user?.membershipId, req.user?.organizationId,
                reviewStatus, projectId, datePreset, page, limit
            );

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Delivery: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    reviewDelivery: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { action, review_note } = req.body;

            const result = await DeliveryService.reviewDelivery(
                id, req.user?.role, req.user?.membershipId, action, review_note
            );

            if (result.forbidden) return res.status(403).json({ type: 'error', message: 'collaborator_role_required' });
            if (result.invalidAction) return res.status(400).json({ type: 'error', message: 'invalid_action' });
            if (result.rejectionNoteRequired) return res.status(400).json({ type: 'error', message: 'rejection_note_required' });
            if (result.notFound) return res.status(404).json({ type: 'error', message: 'record_not_found' });
            if (result.accessDenied) return res.status(403).json({ type: 'error', message: 'access_denied' });
            if (result.alreadyReviewed) return res.status(400).json({ type: 'error', message: 'already_reviewed' });

            await logAudit({
                req,
                action: result.action!,
                entityType: "delivery",
                entityId: result.data!.project_id,
                metadata: {
                    "Delivery Date": result.data!.delivery_date,
                    "Note": result.data!.notes,
                },
            });

            res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error) {
            console.error("Delivery: Review error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const result = await DeliveryService.delete(id, status);

            if (result.invalidStatus) return res.status(400).json({ type: 'error', message: 'invalid_status' });
            if (result.notFound) return res.status(404).json({ type: 'error', message: 'record_not_found' });

            await logAudit({
                req,
                action: status === "true" ? "Enabled" : status === "blocked" ? "Blocked" : "Deleted",
                entityType: "beneficiary",
                entityId: result.data!.id,
                metadata: {
                    Familly_Code: result.data!.notes,
                    Familly_Head: result.data!.created_at,
                    Members: `${result.data} Member(s)`,
                    status,
                },
            });

            res.status(200).json({ type: 'success', message: 'done', data: { id: result.data!.id, status } });
        } catch (error) {
            console.error("Delivery: Toggle Status error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default DeliveryController;