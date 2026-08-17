import { type Request, type Response } from 'express';
import { DataOperationService } from './data-operations.service.js';


const DataOperationController = {

    // ============================================================
    // Fetch all (Data Management page — list of past operations)
    // ============================================================
    fetchAll: async (req: Request, res: Response) => {
        try {
            // TODO: pagination + role/org scoping, same pattern as ProjectController.fetchAll
        } catch (error) {
            console.error("DataOperation: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // ============================================================
    // Fetch one (operation detail)
    // ============================================================
    fetchOne: async (req: Request, res: Response) => {
        try {
            // TODO: return single data_operations record by id
        } catch (error) {
            console.error("DataOperation: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // ============================================================
    // Download error report for a given operation
    // ============================================================
    downloadErrorReport: async (req: Request, res: Response) => {
        try {
            // TODO: stream/redirect to error_report_url (or generate on the fly)
        } catch (error) {
            console.error("DataOperation: Download_Error_Report error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // ============================================================
    // Download template for a dataset
    // ============================================================
    downloadTemplate: async (req: Request, res: Response) => {
        try {
            // TODO: return a static/generated template file for req.params.dataset
        } catch (error) {
            console.error("DataOperation: Download_Template error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // ============================================================
    // Validate (Steps 3–5: structure + column mapping + row validation)
    // ============================================================
    validate: async (req: Request, res: Response) => {
         try {
            console.log("Hello to the validat -->");
            const dataset = (req.params.dataset || '').toUpperCase();
            const organisationId = req.user?.organizationId;
            const userId = req.user?.membershipId;

            if (dataset !== 'BENEFICIARIES') {
                return res.status(400).json({ type: 'error', message: 'dataset_not_supported' });
            }

            const result = await DataOperationService.validateBeneficiaries(req.file, organisationId!, userId!);

            if (result.error === 'file_required' || result.error === 'invalid_file_type' || result.error === 'empty_file') {
                return res.status(400).json({ type: 'error', message: result.error });
            }
            if (result.error === 'header_error') {
                return res.status(400).json({
                    type: 'error',
                    message: 'header_error',
                    data: { missing_columns: result.missingColumns },
                });
            }

            res.status(200).json({
                type: 'success',
                data: {
                    operation_id: result.operationId,
                    summary: result.summary,
                    preview: result.preview,
                    issues: result.issues,
                },
            });
        } catch (error) {
            console.error("DataOperation: Validate error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // ============================================================
    // Preview (Step 6)
    // ============================================================
    preview: async (req: Request, res: Response) => {
        try {
            // TODO: call DataOperationService.preview(...)
        } catch (error) {
            console.error("DataOperation: Preview error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // ============================================================
    // Run import (Steps 7–10)
    // ============================================================
    runImport: async (req: Request, res: Response) => {
        try {
            // TODO: call DataOperationService.runImport(req.file, req.params.dataset, req.body.settings, req.user)
        } catch (error) {
            console.error("DataOperation: Run_Import error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    // ============================================================
    // Run export
    // ============================================================
    runExport: async (req: Request, res: Response) => {
        try {
            // TODO: call DataOperationService.runExport(req.params.dataset, req.body.filters, req.user)
        } catch (error) {
            console.error("DataOperation: Run_Export error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default DataOperationController;