import { Router } from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import { requireRole } from '../../middleware/permission.js';
import AnalyticsController from './analytics.controller.js';

const router = Router();

router.get('/', verifyToken, requireRole('admin'), AnalyticsController.fetch);
router.get('/filters', verifyToken,  requireRole('admin'), AnalyticsController.filters);
router.get('/export', verifyToken, requireRole('admin'), AnalyticsController.export);

export default router;