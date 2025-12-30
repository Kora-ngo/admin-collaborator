import { Router } from "express";
import AssistanceController from "../controller/assistance.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// ASSISTANCE TYPE ROUTE -------------------------->

router.get('/', verifyToken, AssistanceController.fetchAllType);

router.get('/:id', verifyToken, AssistanceController.fetchOneType);

router.post('/', verifyToken, AssistanceController.createType);

router.put('/:id', verifyToken, AssistanceController.updateType);

router.delete('/delete/:id', verifyToken, AssistanceController.deleteType);


export default router;