import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import EnumeratorController from "../controller/enumerator.controller.js";

const router = Router();

router.get('/login', EnumeratorController.login);
router.get('/user-data', verifyToken, EnumeratorController.getMobileUserData)
router.post('/sync', verifyToken, EnumeratorController.syncData);

export default router;