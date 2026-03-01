import { Router } from 'express';
import AuditLogController from '../../controller/admin/auditLog.controller.js';
import { verifySuperAdminToken } from '../../middleware/verifySuperAdminToken.js';


const router = Router();

router.get('/search', verifySuperAdminToken, AuditLogController.search);
router.get('/filter', verifySuperAdminToken, AuditLogController.filter);
router.get('/',       verifySuperAdminToken, AuditLogController.fetchAll);

export default router;