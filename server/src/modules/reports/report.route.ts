import { Router } from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import { requireRole } from '../../middleware/permission.js';
import ReportController from './report.controller.js';

const router = Router();

// Table view — list past generated reports (org-wide or filtered by ?project_id=)
router.get('/filter', verifyToken, requireRole('admin'), ReportController.filter);
router.get('/', verifyToken, requireRole('admin'), ReportController.fetchAll);
router.get('/:id', verifyToken, requireRole('admin'), ReportController.fetchOne);
router.get('/:id/download', verifyToken, requireRole('admin'), ReportController.download);
router.delete('/:id', verifyToken, requireRole('admin'), ReportController.remove);
router.post('/generate', verifyToken, requireRole('admin'), ReportController.generate);

export default router;