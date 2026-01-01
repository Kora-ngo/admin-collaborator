import { Router } from "express";
import MembershipController from "../controller/membership.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// MEMBERSHIP ROUTE ------------------------>

router.get('/search', verifyToken, MembershipController.search);

router.get('/filter', verifyToken, MembershipController.filter);

router.get('/:id', verifyToken, MembershipController.fetchOne);

router.get('/', verifyToken, MembershipController.fetchAll);

router.post('/', verifyToken, MembershipController.create);

router.put('/:id', verifyToken, MembershipController.update);

router.put('/toggle/:id', verifyToken, MembershipController.toggleStatus);


export default router;