import { Router } from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import { requireRole } from '../../middleware/permission.js';
import ReportController from './report.controller.js';

const router = Router();

// Table view — list past generated reports (org-wide or filtered by ?project_id=)
router.get('/', verifyToken, requireRole('admin'), ReportController.fetchAll);

router.get('/:id', verifyToken, requireRole('admin'), ReportController.fetchOne);

router.get('/:id/download', verifyToken, requireRole('admin'), ReportController.download);

// Matches your documented contract: POST /projects/:projectId/exports
// projectId is read from the body per the JSON payload you specified,
// not the URL param — keeping this route flat under /reports for now.
router.post('/generate', verifyToken, requireRole('admin'), ReportController.generate);

export default router;