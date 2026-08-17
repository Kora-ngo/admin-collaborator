import sequelize from '../../config/database.js';
import { generateUniqueUid } from '../../shared/utils/generateUniqueUid.js';
import { DataOperationRepository } from './data-operations.repository.js';
import { parseSpreadsheetFile } from './utils/file-parser.js';
import { buildFamilyPreview, buildSummary, resolveProjectsForRows, validateFamilyConsistency, validateHeaders, validateRow, type ValidationIssue } from './validators/beneficiary.validator.js';

const ALLOWED_EXTENSIONS = ['xlsx', 'csv'];

const validateFileStructure = (file: any) => {
    if (!file) return { error: 'file_required' as const };

    const extension = file.originalname?.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        return { error: 'invalid_file_type' as const };
    }

    if (!file.buffer || file.buffer.length === 0) {
        return { error: 'empty_file' as const };
    }

    return { error: null, extension };
};


export const DataOperationService = {

    // ============================================================
    // Fetch all
    // ============================================================
    fetchAll: async (organisationId: any, page: number, limit: number) => {
        // TODO: pagination, org scoping — mirrors ProjectService.fetchAll
    },

    // ============================================================
    // Fetch one
    // ============================================================
    fetchOne: async (id: string | undefined) => {
        // TODO
    },

    // ============================================================
    // Error report
    // ============================================================
    getErrorReport: async (id: string) => {
        // TODO
    },

    // ============================================================
    // Template
    // ============================================================
    getTemplate: async (dataset: string) => {
        // TODO
    },

    // ============================================================
    // Step 3 — Validate file structure
    // ============================================================
    validateBeneficiaries: async (file: any, organisationId: number, userId: number) => {
        // Stage 1
        const fileCheck = validateFileStructure(file);
        if (fileCheck.error) return { error: fileCheck.error };

        // Log the dry-run as an audit record (no beneficiary/member rows are written)
        const operation = await DataOperationRepository.create({
            uid: generateUniqueUid('data_operations'),
            organization_id: organisationId,
            performed_by_user_id: userId,
            type: 'IMPORT',
            dataset: 'BENEFICIARIES',
            status: 'PROCESSING',
            file_name: file.originalname,
            file_type: fileCheck.extension === 'csv' ? 'CSV' : 'XLSX',
            started_at: new Date(),
        });

        // Read the file
        const { headers, rows } = parseSpreadsheetFile(file.buffer);

        if (rows.length === 0) {
            await DataOperationRepository.update(operation, { status: 'FAILED', completed_at: new Date() });
            return { error: 'empty_file' };
        }

        // Stage 2 — Header validation
        const headerCheck = validateHeaders(headers);
        if (!headerCheck.valid) {
            await DataOperationRepository.update(operation, { status: 'FAILED', completed_at: new Date() });
            return { error: 'header_error', missingColumns: headerCheck.missingColumns };
        }

        // Stage 3 — Row-level field validation
        const rowIssues = new Map<number, ValidationIssue[]>();
        rows.forEach((row, index) => {
            const rowNumber = index + 1;
            rowIssues.set(rowNumber, validateRow(row, rowNumber));
        });

        // Project existence validation
        const { projectMap, issues: projectIssues } = await resolveProjectsForRows(rows, organisationId);
        projectIssues.forEach((issue) => {
            rowIssues.set(issue.row, [...(rowIssues.get(issue.row) || []), issue]);
        });

        // Duplicate family consistency validation
        const familyIssues = validateFamilyConsistency(rows);
        familyIssues.forEach((issue) => {
            rowIssues.set(issue.row, [...(rowIssues.get(issue.row) || []), issue]);
        });

        const allIssues = [...rowIssues.values()].flat().sort((a, b) => a.row - b.row);

        // Grouping + preview
        const families = buildFamilyPreview(rows, projectMap, rowIssues);
        const summary = buildSummary(rows.length, families, allIssues);

        await DataOperationRepository.update(operation, {
            status: 'COMPLETED',
            total_records: summary.total_rows,
            successful_records: summary.total_rows - summary.errors,
            failed_records: summary.errors,
            completed_at: new Date(),
        });

        return {
            error: null,
            operationId: operation.dataValues.id,
            summary,
            preview: families,
            issues: allIssues,
        };
    },


    // ============================================================
    // Step 4 — Column mapping
    // ============================================================
    mapColumns: async (file: any, dataset: string, userMapping?: Record<string, string>) => {
        // TODO: auto-map known columns, merge with admin-provided overrides
    },

    // ============================================================
    // Step 5 — Row validation
    // ============================================================
    validateRows: async (rows: any[], dataset: string, mapping: Record<string, string>) => {
        // TODO: per-row validation (missing fields, invalid enums, duplicates, unknown project, etc.)
    },

    // Combined entry point used by controller.validate (dry run)
    validate: async (file: any, dataset: string, columnMapping: any) => {
        // TODO: orchestrate validateFileStructure -> mapColumns -> validateRows
        // returns { validRows, warningRows, errorRows, errorReport }
    },

    // ============================================================
    // Step 6 — Preview
    // ============================================================
    preview: async (file: any, dataset: string, columnMapping: any) => {
        // TODO: reuse validate() output, return sample rows + summary counts
    },

    // ============================================================
    // Steps 7–10 — Run import
    // ============================================================
    runImport: async (file: any, dataset: string, settings: any, membershipId: any, organisationId: any) => {
        // TODO:
        // 1. re-validate (or accept a token from a prior validate/preview call)
        // 2. apply import settings (duplicate handling, status, project assignment)
        // 3. wrap actual row inserts in a sequelize.transaction()
        // 4. create the data_operations record via DataOperationRepository.create(...)
        // 5. update record with final counts/status via DataOperationRepository.update(...)
        // 6. return summary { imported, warnings, failed, error_report_url }
    },

    // ============================================================
    // Export
    // ============================================================
    runExport: async (dataset: string, filters: any, membershipId: any, organisationId: any) => {
        // TODO: query dataset, generate file, create data_operations record (type: EXPORT)
    },
};