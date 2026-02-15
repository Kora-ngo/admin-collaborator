import { Router } from 'express';
import FeedbackController from '../controller/feedback.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

// POST /feedback - Send feedback email
router.post('/', verifyToken, FeedbackController.sendFeedback);

export default router;