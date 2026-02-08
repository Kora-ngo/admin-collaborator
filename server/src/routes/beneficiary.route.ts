// routes/beneficiary.ts

import { Router } from "express";
import BeneficiaryController from "../controller/beneficiary.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.get('/search', verifyToken, BeneficiaryController.search);
router.get('/filter', verifyToken, BeneficiaryController.filter);
router.get('/:id', verifyToken, BeneficiaryController.fetchOne);
router.get('/', verifyToken, BeneficiaryController.fetchAll);
router.put('/review/:id', verifyToken, BeneficiaryController.reviewBeneficiary);
router.put('/:id', verifyToken, BeneficiaryController.delete);

export default router;