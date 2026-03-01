import { Router } from 'express';
import { verifySuperAdminToken } from '../../middleware/verifySuperAdminToken.js';
import MembershipController from '../../controller/admin/membership.controller.js';


const router = Router();

router.get('/search',       verifySuperAdminToken, MembershipController.search);
router.get('/filter',       verifySuperAdminToken, MembershipController.filter);
router.get('/:id',          verifySuperAdminToken, MembershipController.fetchOne);
router.get('/',             verifySuperAdminToken, MembershipController.fetchAll);
router.put('/block/:id',    verifySuperAdminToken, MembershipController.blockMembership);
router.put('/delete/:id',   verifySuperAdminToken, MembershipController.deleteMembership);
router.put('/restore/:id',  verifySuperAdminToken, MembershipController.restoreMembership);

export default router;