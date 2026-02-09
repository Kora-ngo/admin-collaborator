import { Router } from "express";
import DeliveryController from "../controller/delivery.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get('/search', verifyToken, DeliveryController.search);
router.get('/filter', verifyToken, DeliveryController.filter);
router.get('/:id', verifyToken, DeliveryController.fetchOne);
router.get('/', verifyToken, DeliveryController.fetchAll);
router.put('/review/:id', verifyToken, DeliveryController.reviewDelivery);
router.put('/:id', verifyToken, DeliveryController.delete);


export default router;