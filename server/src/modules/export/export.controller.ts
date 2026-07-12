import { type Request, type Response } from 'express';
import { logAudit } from '../../shared/utils/auditLogger.js';
import { ExportService } from './export.service.js';

const ExportController = {

    exportBeneficiaries: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;

        try {
            if (userRole !== 'admin') {
                return res.status(403).json({ type: 'error', message: 'admin_role_required' });
            }

            const period = (req.query.period as string) || 'all';
            const result = await ExportService.exportBeneficiaries(period, userRole);

            await logAudit({
                req,
                action: 'beneficiary.exported',
                entityType: 'beneficiary',
                metadata: { period, count: result.count },
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.setHeader('Content-Length', result.buffer.length);

            res.status(200).send(result.buffer);
        } catch (error) {
            console.error("Export Beneficiaries error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    exportDeliveries: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;

        try {
            if (userRole !== 'admin') {
                return res.status(403).json({ type: 'error', message: 'admin_role_required' });
            }

            const period = (req.query.period as string) || 'all';
            const result = await ExportService.exportDeliveries(period, userRole);

            await logAudit({
                req,
                action: 'delivery.exported',
                entityType: 'delivery',
                metadata: {
                    period,
                    deliveries_count: result.deliveriesCount,
                    items_count: result.itemsCount,
                },
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.setHeader('Content-Length', result.buffer.length);

            res.status(200).send(result.buffer);
        } catch (error) {
            console.error("Export Deliveries error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default ExportController;