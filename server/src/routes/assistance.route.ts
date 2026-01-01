import { Router } from "express";
import AssistanceController from "../controller/assistance.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// ASSISTANCE ROUTE ------------------------>

router.get('/search', verifyToken, AssistanceController.search);

router.get('/filter', verifyToken, AssistanceController.filter);

router.get('/:id', verifyToken, AssistanceController.fetchOne);

router.get('/', verifyToken, AssistanceController.fetchAll);

router.post('/', verifyToken, AssistanceController.create);

router.put('/:id', verifyToken, AssistanceController.update);

router.put('/toggle/:id', verifyToken, AssistanceController.toggleStatus);



export default router;



