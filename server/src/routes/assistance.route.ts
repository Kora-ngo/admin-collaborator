import { Router } from "express";
import AssistanceController from "../controller/assistance.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// ASSISTANCE ROUTE ------------------------>

router.get('/', verifyToken, AssistanceController.fetchAll);

router.get('/:id', verifyToken, AssistanceController.fetchOne);

router.post('/', verifyToken, AssistanceController.create);

router.put('/:id', verifyToken, AssistanceController.update);

router.put('/delete/:id', verifyToken, AssistanceController.delete);

export default router;



