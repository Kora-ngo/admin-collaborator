import express from 'express';
import SubscriptionController from '../controller/subscription.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/permission.js';

const router = express.Router();

// Get all subscriptions (history)
router.get('/',  verifyToken, requireRole('admin'), SubscriptionController.fetchAll);

// Get current active subscription
router.get('/current',  verifyToken, requireRole('admin'), SubscriptionController.fetchCurrent);

export default router;