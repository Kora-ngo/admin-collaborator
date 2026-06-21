import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import BeneficiaryController from "./beneficiary.controller.js";

const router = Router();

router.get('/search', verifyToken, BeneficiaryController.search);
router.get('/filter', verifyToken, BeneficiaryController.filter);
router.get('/:id', verifyToken, BeneficiaryController.fetchOne);
router.get('/', verifyToken, BeneficiaryController.fetchAll);
router.put('/review/:id', verifyToken, BeneficiaryController.reviewBeneficiary);
router.put('/:id', verifyToken, BeneficiaryController.delete);

export default router;