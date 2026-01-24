import { Router } from "express";
import AssistanceController from "../controller/assistance.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/permission.js";

const router = Router();

// ASSISTANCE TYPE ROUTE -------------------------->

router.get('/', verifyToken, requireRole('admin'), AssistanceController.fetchAllType);

router.get('/:id', verifyToken, requireRole('admin'), AssistanceController.fetchOneType);

router.post('/', verifyToken, requireRole('admin'), AssistanceController.createType);

router.put('/:id', verifyToken, requireRole('admin'), AssistanceController.updateType);

router.delete('/delete/:id', verifyToken, requireRole('admin'), AssistanceController.deleteType);


export default router;