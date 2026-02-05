import { Router } from "express";
import DashboardController from "../controller/dashbaord.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/permission.js";

const router = Router();

// Admin routes
router.get('/admin/key-metrics', verifyToken, requireRole("admin"), DashboardController.adminKeyMetrics);
router.get('/admin/project-progress', verifyToken, requireRole("admin"), DashboardController.adminProjectProgress);
router.get('/admin/alerts', verifyToken, requireRole("admin"), DashboardController.adminAlerts);


// Collaborator routes
router.get('/collaborator/key-metrics', verifyToken, requireRole("collaborator"), DashboardController.collaboratorKeyMetrics);
router.get('/collaborator/enumerator-activity', verifyToken, requireRole("collaborator"), DashboardController.collaboratorEnumeratorActivity);
router.get('/collaborator/validation-queue', verifyToken, requireRole("collaborator"), DashboardController.collaboratorValidationQueue);

export default router;