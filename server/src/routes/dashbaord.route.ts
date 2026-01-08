import { Router } from "express";
import DashboardController from "../controller/dashbaord.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// DASHBOARD ROUTES
router.get('/key-metrics', verifyToken, DashboardController.adminKeyMetrics);
router.get('/project-progress', verifyToken, DashboardController.adminProjectProgress);

export default router;