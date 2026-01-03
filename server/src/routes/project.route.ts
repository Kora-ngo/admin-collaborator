import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import ProjectController from "../controller/project.controller.js";

const router = Router();

// router.get('/search', verifyToken, ProjectController.search);
// router.get('/filter', verifyToken, ProjectController.filter);
router.get('/:id', verifyToken, ProjectController.fetchOne);
router.get('/', verifyToken, ProjectController.fetchAll);
router.post('/', verifyToken, ProjectController.create);
router.put('/:id', verifyToken, ProjectController.update);
router.put('/status/:id', verifyToken, ProjectController.updateStatus);
