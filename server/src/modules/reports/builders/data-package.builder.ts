import { createRequire } from 'module';
import {  OrganisationModel } from '../../index.js';
import { buildDocumentationExport } from './documentation-export.builder.js';
import { buildBeneficiariesExport } from './beneficiary-export.builder.js';
import { buildAssistanceExport } from './assistance-export.builder.js';
import { buildAnalyticsExport } from './analytics-export.builder.js';
import type { ReportPackageOptions } from '../types/report.js';
import ProjectRegionModel from '../../project-region/project-region.model.js';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

export const buildDataPackageExport = async (
    project: any,
    options: ReportPackageOptions,
    from?: string,
    to?: string
): Promise<{ buffer: Buffer; fileName: string }> => {


    const components: { name: string; buffer: Buffer }[] = [];

    if (options.projectDocumentation) {
        const [organisation, regions] = await Promise.all([
            OrganisationModel.findByPk(project.organisation_id),
            ProjectRegionModel.findAll({ where: { project_id: project.id }, attributes: ['region'], raw: true }),
        ]);

        const { buffer } = await buildDocumentationExport(
            project,
            organisation?.dataValues?.name || '',
            regions.map((r: any) => r.region),
            from, to
        );
        components.push({ name: 'Project_Documentation.pdf', buffer });
    }

    if (options.beneficiaries) {
        const { buffer } = await buildBeneficiariesExport(project.id, project.name, from, to);
        components.push({ name: 'Beneficiaries.xlsx', buffer });
    }

    if (options.assistance) {
        const { buffer } = await buildAssistanceExport(project.id, project.name, from, to);
        components.push({ name: 'Assistance.xlsx', buffer });
    }

    if (options.charts) {
        const { buffer } = await buildAnalyticsExport(project, from, to);
        components.push({ name: 'Project_Charts.pdf', buffer });
    }

    // Guarded upstream in report.service.ts (generate() validation), but
    // defensive here too — an empty ZIP is a confusing silent failure.
    if (components.length === 0) {
        throw new Error('buildDataPackageExport: no components enabled');
    }

    const buffer = await new Promise<Buffer>((resolve, reject) => {

        const archive = archiver({ zlib: { level: 9 } });
        const chunks: Buffer[] = [];

        archive.on('data', (chunk: any) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', (err: any) => reject(err));

        components.forEach((c) => archive.append(c.buffer, { name: c.name }));
        archive.finalize();
    });

    const safeProjectName = project.name.replace(/[^a-z0-9]+/gi, '_');
    const periodSuffix = from && to ? `_${from}_to_${to}` : '';
    const fileName = `Kora_Project_Package_${safeProjectName}${periodSuffix}.zip`;

    return { buffer, fileName };
};