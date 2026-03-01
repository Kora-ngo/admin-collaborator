import { Router } from 'express';
import { verifySuperAdminToken } from '../../middleware/verifySuperAdminToken.js';
import ProjectController from '../../controller/admin/project.controller.js';

const router = Router();

router.get('/search', verifySuperAdminToken, ProjectController.search);
router.get('/filter', verifySuperAdminToken, ProjectController.filter);
router.get('/:id',    verifySuperAdminToken, ProjectController.fetchOne);
router.get('/',       verifySuperAdminToken, ProjectController.fetchAll);

export default router;