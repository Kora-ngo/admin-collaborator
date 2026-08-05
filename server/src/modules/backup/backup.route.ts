import { Router } from "express";
import BackupController from "./backup.controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { requireRole } from "../../middleware/permission.js";
import { verifySuperAdminToken } from "../../middleware/verifySuperAdminToken.js";
import { uploadKora } from "../../middleware/upload.js";


const router = Router();

// Org Admin routes
// Org admin backs up their own org
router.post("/", verifyToken, requireRole("admin"), BackupController.create);

// Org admin views their own backups
router.get("/", verifyToken, requireRole("admin"), BackupController.fetchAll);



// ── Super Admin routes ───────────────────────────────────────────
// Back up a single specific org
router.post("/single/:organisationId", verifySuperAdminToken,BackupController.createForOrg);

// Back up all orgs (or a selection)
router.post("/bulk", verifySuperAdminToken, BackupController.createBulk );

// Automatic backup — called by cron
router.post("/automatic", verifySuperAdminToken, BackupController.createAutomatic );

// Overview — latest backup + stats per org
router.get("/overview", verifySuperAdminToken, BackupController.fetchOverview);

// Backups for a specific org
router.get("/org/:organisationId", verifySuperAdminToken, BackupController.fetchByOrg);

router.get("/:id/download", verifySuperAdminToken, BackupController.download);

router.delete("/:id", verifySuperAdminToken, BackupController.delete);

router.post("/restore", uploadKora.single("file"), verifySuperAdminToken, BackupController.restore);

export default router;