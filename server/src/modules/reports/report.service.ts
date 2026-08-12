import ProjectModel from '../project/project.model.js';
import { generateUniqueUid } from '../../shared/utils/generateUniqueUid.js';
import { ReportRepository } from './report.repository.js';
import { uploadReportFile } from './utils/report-storage.util.js';
import type { GenerateReportRequest } from './types/report.js';
import { buildBeneficiariesExport } from './builders/beneficiary-export.builder.js';
import { buildAssistanceExport } from './builders/assistance-export.builder.js';
import { buildAnalyticsExport } from './builders/analytics-export.builder.js';
import { buildDataPackageExport } from './builders/data-package.builder.js';
import { buildDonorReportExport } from './builders/donor-report-export.builder.js';
import OrganisationModel from '../organisation/organisation.model.js';
import { buildDocumentationExport } from './builders/documentation-export.builder.js';
import { Op } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

const REPORT_FORMAT_BY_TYPE: Record<string, 'ZIP' | 'XLSX' | 'PDF'> = {
    DATA_PACKAGE: 'ZIP',
    BENEFICIARIES: 'XLSX',
    ASSISTANCE: 'XLSX',
    ANALYTICS: 'PDF',
    DONOR_REPORT: 'PDF',
};

export const ReportService = {

    // ============================================================
    // List reports for a project (table view)
    // ============================================================

    // ============================================================
    // Delete a report
    // ============================================================
    remove: async (id: string, organisationId: number) => {
        const report = await ReportRepository.findByPk(id);
        if (!report || report.dataValues.organization_id !== organisationId) {
            return { notFound: true };
        }

        // Best-effort file cleanup — a failed storage delete should not
        // block removing the DB record, but is logged so orphaned files
        // can be found later if this ever happens.
        // NOTE: currently a no-op path while B2 upload is commented out
        // for local testing (file_path holds a local tmp-reports/ path,
        // not a B2 key) — safe to leave as-is until upload is restored.
        try {
            // if (report.dataValues.file_path) {
            //     await deleteReportFile(report.dataValues.file_path);
            // }
        } catch (err) {
            console.warn(`Report ${id}: file cleanup failed (non-critical)`, err);
        }

        await ReportRepository.destroy(report);
        return { notFound: false };
    },


    // ============================================================
    // Filter — type / format / status / project / date range
    // ============================================================
    filter: async (
        organisationId: number,
        filters: { type?: string; format?: string; status?: string; projectId?: number; from?: string; to?: string },
        page: number,
        limit: number
    ) => {
        const offset = (page - 1) * limit;
        const where: any = { organization_id: organisationId };

        if (filters.type) where.type = filters.type;
        if (filters.format) where.format = filters.format;
        if (filters.status) where.status = filters.status;
        if (filters.projectId) where.project_id = filters.projectId;

        if (filters.from && filters.to) {
            where.created_at = { [Op.gte]: new Date(filters.from), [Op.lte]: new Date(`${filters.to}T23:59:59`) };
        }

        const { count, rows } = await ReportRepository.findAndCountAll(where, limit, offset);

        return {
            rows: rows.map((r: any) => r.toJSON()),
            pagination: {
                total: count, page, limit,
                totalPages: Math.ceil(count / limit),
                hasNext: page * limit < count,
                hasPrev: page > 1,
            },
        };
    },


    fetchAll: async (organisationId: number, projectId: number | undefined, page: number, limit: number) => {
        const offset = (page - 1) * limit;
        const where: any = { organization_id: organisationId };
        if (projectId) where.project_id = projectId;

        const { count, rows } = await ReportRepository.findAndCountAll(where, limit, offset);

        return {
            rows: rows.map((r: any) => r.toJSON()),
            pagination: {
                total: count, page, limit,
                totalPages: Math.ceil(count / limit),
                hasNext: page * limit < count,
                hasPrev: page > 1,
            },
        };
    },

    fetchOne: async (id: string) => {
        const report = await ReportRepository.findByPk(id);
        if (!report) return { notFound: true };
        return { notFound: false, data: report.toJSON() };
    },

    // ============================================================
    // Generate a report (the actual entry point the controller calls)
    // ============================================================
    generate: async (payload: GenerateReportRequest, organisationId: number, membershipId: number) => {
        // 1. Validate the project belongs to this org — never trust
        //    projectId from the frontend without checking ownership.
        const project = await ProjectModel.findOne({
            where: { id: payload.projectId, organisation_id: organisationId },
        });
        if (!project) return { error: 'project_not_found_or_access_denied' };

        if (!payload.type || !payload.format) {
            return { error: 'type_and_format_required' };
        }

        // DATA_PACKAGE requires at least one option enabled; other types
        // ignore `options` entirely, per the agreed contract.
        if (payload.type === 'DATA_PACKAGE') {
            const opts = payload.options || {};
            const anyEnabled = Object.values(opts).some(Boolean);
            if (!anyEnabled) return { error: 'at_least_one_package_option_required' };
        }

        // 2. Create the report record up front (status PENDING), so the
        //    table view can show "generating..." immediately.
        const uid = await generateUniqueUid('reports');
        const report = await ReportRepository.create({
            uid,
            project_id: project.dataValues.id,
            organization_id: organisationId,
            type: payload.type,
            format: payload.format,
            reporting_period_from: payload.reportingPeriod?.from,
            reporting_period_to: payload.reportingPeriod?.to,
            generated_by: membershipId,
            status: 'PENDING',
            file_type: 'general',
        });

        // 3. Kick off generation. For now this runs inline/synchronously;
        //    this is the seam where a queue/worker would take over later
        //    (same "event-ready unit" pattern used in enumerator sync).
        try {
            await ReportRepository.update(report, { status: 'PROCESSING' });

            const generated = await ReportService.buildReportFile(payload, project.dataValues);

            // ============================================================
            // TEMP — B2 upload disabled for local testing.
            // Writes the generated file to disk so it can be opened and
            // checked directly. Swap this block back for the commented
            // uploadReportFile call once the documents look correct.
            // ============================================================
            const tempDir = path.join(process.cwd(), 'tmp-reports');
            await fs.mkdir(tempDir, { recursive: true });
            const tempFilePath = path.join(tempDir, generated.fileName);
            await fs.writeFile(tempFilePath, generated.buffer);
            console.log(`[report] Saved locally for inspection: ${tempFilePath}`);

            const uploadResult = { filePath: tempFilePath, fileSize: generated.buffer.length };

            // const uploadResult = await uploadReportFile(
            //     generated.buffer,
            //     generated.fileName,
            //     organisationId,
            //     project.dataValues.id
            // );

            await ReportRepository.update(report, {
                status: 'COMPLETED',
                generated_at: new Date(),
                file_path: uploadResult.filePath,
                file_size: uploadResult.fileSize,
            });

            return { error: null, data: (await ReportRepository.findByPk(report!.dataValues!.id))?.toJSON() };
        } catch (err) {
            console.error('Report generation failed:', err);
            await ReportRepository.update(report, { status: 'FAILED' });
            return { error: 'generation_failed' };
        }
    },

    // ============================================================
    // Actual file-building logic — split by type. STUBS FOR NOW.
    // Each of these is a substantial piece of work on its own
    // (PDF layout, XLSX formatting, ZIP assembly) — intentionally
    // not built out yet, per the incremental approach.
    // ============================================================
    buildReportFile: async (payload: GenerateReportRequest, project: any): Promise<{ buffer: Buffer; fileName: string }> => {
        switch (payload.type) {
            case 'BENEFICIARIES':
                return buildBeneficiariesExport(
                    project.id,
                    project.name,
                    payload.reportingPeriod?.from,
                    payload.reportingPeriod?.to
                );

            case 'ASSISTANCE':
                return buildAssistanceExport(
                    project.id, project.name,
                    payload.reportingPeriod?.from, payload.reportingPeriod?.to
                );
            case 'ANALYTICS':
                return buildAnalyticsExport(
                    project, 
                    payload.reportingPeriod?.from,
                    payload.reportingPeriod?.to
                );
            case 'DONOR_REPORT': {
                const organisation = await OrganisationModel.findByPk(project.organisation_id);
                return buildDonorReportExport(
                    project,
                    organisation?.dataValues?.name || '',
                    payload.reportingPeriod?.from,
                    payload.reportingPeriod?.to,
                    payload.executiveSummary,
                    payload.narrativeHighlights
                );
            }
            case 'PROJECT_DOCUMENTATION': {
                const organisation = await OrganisationModel.findByPk(project.organisation_id);
                return buildDocumentationExport(
                    project,
                    organisation?.dataValues?.name || '',
                    [],
                    payload.reportingPeriod?.from,
                    payload.reportingPeriod?.to,
                );
            }
            case 'DATA_PACKAGE':
                return buildDataPackageExport(
                    project,
                    payload.options || {},
                    payload.reportingPeriod?.from,
                    payload.reportingPeriod?.to
                );
            default:
                throw new Error(`buildReportFile: unknown report type "${payload.type}"`);
        }
    },
};