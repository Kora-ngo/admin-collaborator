import { Router } from 'express';
import HealthController from '../controller/health.controller.js';


const router = Router();

router.get('/', HealthController.health);

export default router;