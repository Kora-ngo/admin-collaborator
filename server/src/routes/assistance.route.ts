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



// ASSISTANCE TYPE ROUTE -------------------------->

router.get('/type', verifyToken, AssistanceController.fetchAllType);

router.get('/type/:id', verifyToken, AssistanceController.fetchOneType);

router.post('/type', verifyToken, AssistanceController.createType);

router.put('/type/:id', verifyToken, AssistanceController.updateType);

router.put('/type/delete/:id', verifyToken, AssistanceController.deleteType);


export default router;
