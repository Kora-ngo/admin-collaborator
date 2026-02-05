// routes/export.ts

import { Router } from "express";
import ExportController from "../controller/export.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get('/beneficiaries', verifyToken, ExportController.exportBeneficiaries);
router.get('/deliveries', verifyToken, ExportController.exportDeliveries);

export default router;