import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import AuditLogController from "./audit-log.controller.js";

const router = Router();

router.get('/search', verifyToken, AuditLogController.search);
router.get('/filter', verifyToken, AuditLogController.filter);
router.get('/', verifyToken, AuditLogController.fetchAll);

export default router;