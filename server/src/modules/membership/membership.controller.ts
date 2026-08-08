import type { Request, Response } from 'express';
import { logAudit } from '../../shared/utils/auditLogger.js';
import { MembershipService } from './membership.service.js';

const MembershipController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const authUser = req.user;
            const status = req.query.status as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;

            const result = await MembershipService.fetchAll(
                authUser?.role, authUser?.membershipId, authUser?.organizationId,
                authUser?.userId, status, page, limit
            );

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Membership: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await MembershipService.fetchOne(id);

            if (result.notFound) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }

            res.status(200).json({ type: 'success', data: result.data });
        } catch (error) {
            console.error("Membership: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const result = await MembershipService.create(req.body);

            if (result.validationError) {
                return res.status(400).json({ type: 'error', message: result.validationError });
            }
            if (result.thrownError) {
                return res.status(result.thrownError.statusCode).json({
                    type: result.thrownError.type,
                    message: result.thrownError.message,
                });
            }

            await logAudit({
                req,
                action: 'Create',
                entityType: 'user',
                entityId: result.data!.newMembership.dataValues.id,
                metadata: {
                    name: req.body.name,
                    email: req.body.email,
                    role: req.body.role,
                    status: 'true',
                },
            });

            return res.status(201).json({
                type: 'success',
                message: 'done',
                data: result.data!.membershipWithDetails,
            });
        } catch (error: any) {
            console.error("Membership: Create error:", error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ type: 'error', message: 'record_already_exists' });
            }

            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await MembershipService.update(id, req.body);

            if (result.notFound) {
                res.status(404).json({ type: 'error', message: 'record_not_found' });
                return;
            }

            res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error: any) {
            console.error("Membership: Update error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    toggleStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const result = await MembershipService.toggleStatus(id, status);

            if (result.invalidStatus) return res.status(400).json({ type: 'error', message: 'invalid_status' });
            if (result.notFound) return res.status(404).json({ type: 'error', message: 'record_not_found' });
            if (result.cannotDelete) {
                return res.status(400).json({
                    type: 'warning',
                    message: 'cannot_delete_member_with_data',
                    details: result.details,
                });
            }
            if (result.noChange) {
                return res.status(200).json({ type: 'success', message: 'no_change', data: result.data });
            }

            await logAudit({
                req,
                action: status === 'true' ? 'Enabled' : status === 'blocked' ? 'Blocked' : 'Deleted',
                entityType: 'user',
                entityId: result.auditContext!.entityId,
                metadata: {
                    name: result.auditContext!.name,
                    email: result.auditContext!.email,
                    role: result.auditContext!.role,
                    status,
                },
            });

            res.status(200).json({ type: 'success', message: 'done', data: result.data });
        } catch (error) {
            console.error("Membership: Toggle Status error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const authUser = req.user;
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;

            const result = await MembershipService.search(
                q, authUser?.role, authUser?.membershipId, authUser?.organizationId, page, limit
            );

            if (result.validationError) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Membership: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const authUser = req.user;
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;

            const statusFilter = (req.query.status as string)?.trim();
            const roleFilter = req.query.role ? (req.query.role as string).trim() : undefined;
            const datePreset = (req.query.datePreset as string)?.trim();

            const result = await MembershipService.filter(
                authUser?.role, authUser?.membershipId, authUser?.organizationId,
                statusFilter, roleFilter, datePreset, page, limit
            );

            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error("Membership: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    checkMemberEmail: async (req: Request, res: Response) => {
            try {
                const { email } = req.query;
                const result = await MembershipService.checkMemberEmail(
                email,
                req.user?.organizationId
                );

                if (result.validationError) {
                return res.status(400).json({
                    type: "error",
                    message: result.validationError,
                });
                }

                const typeByResult: Record<string, string> = {
                email_available: "success",
                email_exists_deleted: "warning",
                email_already_exists: "error",
                };

                return res.status(200).json({
                type: typeByResult[result.result!],
                message: result.result,
                });
            } catch (error) {
                console.error("checkMemberEmail error:", error);
                return res.status(500).json({
                type: "error",
                message: "server_error",
                });
            }
    },
};

export default MembershipController;