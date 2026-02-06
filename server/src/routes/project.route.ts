import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import ProjectController from "../controller/project.controller.js";
import { upload } from "../middleware/upload.js";
import { requireRole } from "../middleware/permission.js";

const router = Router();

router.get('/search', verifyToken, ProjectController.search);
router.get('/filter', verifyToken, ProjectController.filter);
router.get('/:id', verifyToken, ProjectController.fetchOne);
router.get('/', verifyToken, ProjectController.fetchAll);

// File upload route - accepts multiple files with field name 'files'
router.post('/', verifyToken, requireRole('admin'), upload.array('files', 10), ProjectController.create);
router.put('/:id', verifyToken, requireRole('admin'), ProjectController.update);
router.get('/:id/can-delete', requireRole('admin'), ProjectController.canDelete);
router.put('/toggle/:id', verifyToken, requireRole('admin'), ProjectController.toggleStatus);

export default router;
