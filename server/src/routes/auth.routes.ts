import { Router } from 'express';
import AuthController from '../controller/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/register-admin
router.post('/register-admin', AuthController.registerAdmin);

// POST /api/auth/invite
router.post('/invite', AuthController.inviteUser);

// POST /api/auth/select-membership
router.post('/select-membership', AuthController.selectMembership);

// POST /api/auth/accept-invitation
router.post('/accept-invitation', AuthController.acceptInvitation);

// POST /api/auth/forgot-password
router.post('/forgot-password', AuthController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', AuthController.resetPassword);

// POST /api/auth/refresh-token
// router.post('/refresh-token', AuthController.refreshToken);

// GET /api/auth/me
router.get('/me', verifyToken, AuthController.getCurrentUser);

export default router;