import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { requireRole } from "../../middleware/permission.js";
import { upload } from "../../middleware/upload.js";
import DataOperationController from "./data-operations.controller.js";

const router = Router();

// ============================================================
// Data Management (list / detail of past operations)
// ============================================================

// GET /data-operations
// List all import/export operations for the org (paginated).
// Powers the "Data Management" page audit trail.
router.get('/', verifyToken, DataOperationController.fetchAll);

// GET /data-operations/:id
// Fetch a single operation record with full detail
// (counts, status, error_report_url, etc.)
router.get('/:id', verifyToken, DataOperationController.fetchOne);

// GET /data-operations/:id/error-report
// Download the error report generated for a completed/failed operation.
router.get('/:id/error-report', verifyToken, DataOperationController.downloadErrorReport);

// ============================================================
// Template download (Step 2 helper)
// ============================================================

// GET /data-operations/template/:dataset
// Returns a downloadable template (.xlsx/.csv) for the requested dataset
// (BENEFICIARIES | PROJECTS | DELIVERIES | USERS).
router.get('/template/:dataset', verifyToken, DataOperationController.downloadTemplate);

// ============================================================
// Import workflow (admin only — write operations)
// ============================================================

// POST /data-operations/:dataset/validate
// Steps 3–5: validate file structure + column mapping + row-level validation.
// This is the "Dry Run" endpoint — no data is written.
router.post('/:dataset/validate', verifyToken, requireRole('admin'), upload.single('file'), DataOperationController.validate);

// POST /data-operations/:dataset/preview
// Step 6: returns a preview sample + summary (will create / will skip / warnings)
// based on a previously validated file (or re-validates + previews in one call — TBD).
router.post('/:dataset/preview',verifyToken, requireRole('admin'), DataOperationController.preview);

// POST /data-operations/:dataset
// Steps 7–10: actually run the import with the chosen settings
// (duplicate handling, status, project assignment), then create the
// data_operations record and return the result summary.
router.post('/:dataset',verifyToken,requireRole('admin'),upload.single('file'), DataOperationController.runImport);

// ============================================================
// Export workflow (placeholder — not detailed yet)
// ============================================================

// POST /data-operations/:dataset/export
// Kicks off an export operation for the given dataset.
router.post('/:dataset/export',verifyToken,requireRole('admin'),DataOperationController.runExport);

export default router;