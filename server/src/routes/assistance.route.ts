import { Router } from "express";
import AssistanceController from "../controller/assistance.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/permission.js";

const router = Router();

// ASSISTANCE ROUTE ------------------------>

router.get('/search', verifyToken, requireRole('admin'), AssistanceController.search);

router.get('/filter', verifyToken, requireRole('admin'), AssistanceController.filter);

router.get('/:id', verifyToken, requireRole('admin'), AssistanceController.fetchOne);

router.get('/', verifyToken, requireRole('admin'), AssistanceController.fetchAll);

router.post('/', verifyToken, requireRole('admin'), AssistanceController.create);

router.put('/:id', verifyToken, requireRole('admin'), AssistanceController.update);

router.put('/toggle/:id', verifyToken, requireRole('admin'), AssistanceController.toggleStatus);



export default router;



