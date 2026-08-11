import { type Request, type Response } from 'express';
import { ReportService } from './report.service.js';
import { getReportDownloadUrl } from './utils/report-storage.util.js';

const ReportController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const projectId = req.query.project_id ? Number(req.query.project_id) : undefined;

            const result = await ReportService.fetchAll(req.user!.organizationId!, projectId, page, limit);
            res.status(200).json({ type: 'success', data: result.rows, pagination: result.pagination });
        } catch (error) {
            console.error('Report: Fetch_All error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const result = await ReportService.fetchOne(req.params.id!);
            if (result.notFound) return res.status(404).json({ type: 'error', message: 'record_not_found' });
            res.status(200).json({ type: 'success', data: result.data });
        } catch (error) {
            console.error('Report: Fetch_One error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    generate: async (req: Request, res: Response) => {
        try {
            const result = await ReportService.generate(req.body, req.user!.organizationId!, req.user!.membershipId!);

            if (result.error) {
                const status = result.error === 'project_not_found_or_access_denied' ? 404 : 400;
                return res.status(status).json({ type: 'error', message: result.error });
            }

            res.status(201).json({ type: 'success', message: 'done', data: result.data });
        } catch (error) {
            console.error('Report: Generate error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    download: async (req: Request, res: Response) => {
            try {
                const result = await ReportService.fetchOne(req.params.id!);
                if (result.notFound) return res.status(404).json({ type: 'error', message: 'record_not_found' });

                const report = result.data;
                if (!report!.file_path) {
                    return res.status(400).json({ type: 'error', message: 'file_not_ready' });
                }

                const url = await getReportDownloadUrl(report!.file_path);
                res.status(200).json({ type: 'success', data: { url } });
            } catch (error) {
                console.error('Report: Download error:', error);
                res.status(500).json({ type: 'error', message: 'server_error' });
            }
        },
};

export default ReportController;