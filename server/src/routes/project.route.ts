import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import ProjectController from "../controller/project.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get('/search', verifyToken, ProjectController.search);
router.get('/filter', verifyToken, ProjectController.filter);
router.get('/:id', verifyToken, ProjectController.fetchOne);
router.get('/', verifyToken, ProjectController.fetchAll);

// File upload route - accepts multiple files with field name 'files'
router.post('/', verifyToken, upload.array('files', 10), ProjectController.create);
router.put('/:id', verifyToken, ProjectController.update);
router.put('/toggle/:id', verifyToken, ProjectController.toggleStatus);

export default router;
