import { Router } from 'express';
import SuperAdminController from '../controller/superAdmin.controller.js';
import { verifySuperAdminToken } from '../middleware/verifySuperAdminToken.js';

const router = Router();

router.post('/login', SuperAdminController.login);
router.post('/register', SuperAdminController.register);
router.post('/logout', verifySuperAdminToken, SuperAdminController.logout);
router.get('/me', verifySuperAdminToken, SuperAdminController.me);

export default router;