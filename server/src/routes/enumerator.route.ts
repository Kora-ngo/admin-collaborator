import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import EnumeratorController from "../controller/enumerator.controller.js";

const router = Router();

router.get('/user-data', verifyToken, EnumeratorController.getMobileUserData)

export default router;