import { Router } from 'express';
import OrganisationController from '../../controller/admin/organisation.controller.js';
import { verifySuperAdminToken } from '../../middleware/verifySuperAdminToken.js';

const router = Router();

router.get('/search',  verifySuperAdminToken, OrganisationController.search);
router.get('/filter',  verifySuperAdminToken, OrganisationController.filter);
router.get('/:id',     verifySuperAdminToken, OrganisationController.fetchOne);
router.get('/',        verifySuperAdminToken, OrganisationController.fetchAll);
router.put('/toggle/:id', verifySuperAdminToken, OrganisationController.toggleStatus);
router.delete('/:id', verifySuperAdminToken, OrganisationController.deleteOrganisation);

export default router;