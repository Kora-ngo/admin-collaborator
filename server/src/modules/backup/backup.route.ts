import { Router } from "express";
import BackupController from "./backup.controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { requireRole } from "../../middleware/permission.js";

const router = Router();

router.use(verifyToken, requireRole("admin"));

router.post("/", BackupController.create);
router.get("/", BackupController.fetchAll);
router.get("/:id/download", BackupController.download);
router.delete("/:id", BackupController.delete);

export default router;