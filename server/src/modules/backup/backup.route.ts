import { Router } from "express";
import BackupController from "./backup.controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { requireRole } from "../../middleware/permission.js";

const router = Router();

// router.use(verifyToken, requireRole("admin"));

router.post("/", verifyToken, requireRole('admin'), BackupController.create);
router.get("/", verifyToken, requireRole('admin'), BackupController.fetchAll);
router.get("/:id/download", verifyToken, requireRole('admin'), BackupController.download);
router.delete("/:id", verifyToken, requireRole('admin'), BackupController.delete);

export default router;