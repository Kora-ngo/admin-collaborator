import { Router } from 'express';
import { verifySuperAdminToken } from '../../../middleware/verifySuperAdminToken.js';
import AuditLogController from './audit-log.controller.js';


const router = Router();

router.get('/search', verifySuperAdminToken, AuditLogController.search);
router.get('/filter', verifySuperAdminToken, AuditLogController.filter);
router.get('/',       verifySuperAdminToken, AuditLogController.fetchAll);

export default router;