import { Router } from "express";
import DashboardController from "./dashbaord.controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { requireRole } from "../../middleware/permission.js";

const router = Router();

// Admin routes
router.get('/admin', verifyToken, requireRole("admin"), DashboardController.adminDashboard);


// Collaborator routes
router.get('/collaborator/key-metrics', verifyToken, requireRole("collaborator"), DashboardController.collaboratorKeyMetrics);
router.get('/collaborator/enumerator-activity', verifyToken, requireRole("collaborator"), DashboardController.collaboratorEnumeratorActivity);
router.get('/collaborator/validation-queue', verifyToken, requireRole("collaborator"), DashboardController.collaboratorValidationQueue);

export default router;