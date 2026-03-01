import { Router } from 'express';
import SubscriptionController from '../../controller/admin/subscription.controller.js';
import { verifySuperAdminToken } from '../../middleware/verifySuperAdminToken.js';


const router = Router();

router.get('/search',         verifySuperAdminToken, SubscriptionController.search);
router.get('/filter',         verifySuperAdminToken, SubscriptionController.filter);
router.get('/org/:orgId',     verifySuperAdminToken, SubscriptionController.fetchByOrg);
router.get('/',               verifySuperAdminToken, SubscriptionController.fetchAll);
router.post('/',              verifySuperAdminToken, SubscriptionController.create);

export default router;