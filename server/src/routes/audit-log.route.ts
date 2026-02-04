import { Router } from "express";
import AuditLogController from "../controller/auditLog.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get('/search', verifyToken, AuditLogController.search);
router.get('/filter', verifyToken, AuditLogController.filter);
router.get('/', verifyToken, AuditLogController.fetchAll);

export default router;