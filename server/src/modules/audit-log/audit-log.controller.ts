import type { Request, Response } from 'express';
import { AuditLogService } from './audit-log.service.js';

const AuditLogController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await AuditLogService.fetchAll(req.user, page, limit);

            const auditLogsData = result.rows.map((log: any) => {
                const data = log.dataValues || log;
                return {
                    ...data,
                    actor: data.actor?.dataValues || data.actor
                };
            });

            res.status(200).json({
                type: 'success',
                data: auditLogsData,
                pagination: result.pagination
            });

        } catch (error) {
            console.error("AuditLog: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 20;

            if (!q) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            const result = await AuditLogService.search(req.user, q, page, limit);

            res.status(200).json({
                type: 'success',
                data: result.rows.map((log: any) => log.toJSON ? log.toJSON() : log),
                pagination: result.pagination
            });

        } catch (error) {
            console.error("AuditLog: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 20;

            const filters = {
                entityType: (req.query.entityType as string)?.trim(),
                actorRole: (req.query.actorRole as string)?.trim(),
                platform: (req.query.platform as string)?.trim(),
                datePreset: (req.query.datePreset as string)?.trim(),
            };

            const result = await AuditLogService.filter(req.user, filters, page, limit);

            res.status(200).json({
                type: 'success',
                data: result.rows.map((log: any) => log.toJSON ? log.toJSON() : log),
                pagination: result.pagination
            });

        } catch (error) {
            console.error("AuditLog: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    }
};

export default AuditLogController;