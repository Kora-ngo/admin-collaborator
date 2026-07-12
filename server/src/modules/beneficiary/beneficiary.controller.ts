import type { Request, Response } from "express";
import { BeneficiaryService } from "./beneficiary.service.js";


const BeneficiaryController = {

    fetchAll: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const organisationId = authUser?.organizationId;
        const membershipId = authUser?.membershipId;

        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { rows, count } = await BeneficiaryService.fetchAll(userRole, membershipId, organisationId, page, limit);

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
            console.error("Beneficiary: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const { id } = req.params;
            const result = await BeneficiaryService.fetchOne(id, userRole, membershipId);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            if (result.accessDenied) {
                return res.status(403).json({ type: 'error', message: 'access_denied' });
            }

            res.status(200).json({ type: 'success', data: result.data });

        } catch (error) {
            console.error("Beneficiary: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;

            if (!q) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            const { rows, count } = await BeneficiaryService.search(q, userRole, membershipId, authUser?.organizationId, page, limit);

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
            console.error("Beneficiary: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const reviewStatus = (req.query.reviewStatus as string)?.trim();
            const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
            const datePreset = (req.query.datePreset as string)?.trim();

            const { rows, count } = await BeneficiaryService.filter(
                userRole, membershipId, authUser?.organizationId,
                reviewStatus, projectId, datePreset,
                page, limit
            );

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
            console.error("Beneficiary: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    reviewBeneficiary: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const { id } = req.params;
            const { action, review_note } = req.body;

            if (userRole !== 'collaborator') {
                return res.status(403).json({ type: 'error', message: 'collaborator_role_required' });
            }

            if (!action || (action !== 'approve' && action !== 'reject')) {
                return res.status(400).json({ type: 'error', message: 'invalid_action' });
            }

            if (action === 'reject' && (!review_note || review_note.trim() === "")) {
                return res.status(400).json({ type: 'error', message: 'rejection_note_required' });
            }

            const result = await BeneficiaryService.reviewBeneficiary(id, action, review_note, membershipId, req);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            if (result.accessDenied) {
                return res.status(403).json({ type: 'error', message: 'access_denied' });
            }

            if (result.alreadyReviewed) {
                return res.status(400).json({ type: 'error', message: 'already_reviewed' });
            }

            res.status(200).json({ type: 'success', message: 'done', data: result.data });

        } catch (error) {
            console.error("Beneficiary: Review error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (status != "rejected") {
                return res.status(400).json({ type: 'error', message: 'invalid_status' });
            }

            const result = await BeneficiaryService.delete(id, status, req);

            if (result.notFound) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            res.status(200).json({ type: 'success', message: 'done', data: result.data });

        } catch (error) {
            console.error("Membership: Toggle Status error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    }

};

export default BeneficiaryController;