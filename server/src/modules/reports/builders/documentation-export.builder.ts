import PDFDocument from 'pdfkit';
import { AnalyticsService } from '../../analytics/analytics.service.js';

const DARK = '#111827';
const MUTED = '#9ca3af';
const PRIMARY = '#4f46e5';

const formatDate = (date?: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]!;
};

const fieldRow = (doc: PDFKit.PDFDocument, label: string, value: string) => {
    doc.fillColor(MUTED).fontSize(10).font('Helvetica').text(label, { continued: true });
    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(`  ${value || '—'}`);
    doc.moveDown(0.2);
};

const sectionTitle = (doc: PDFKit.PDFDocument, text: string) => {
    doc.moveDown(0.6);
    doc.fillColor(DARK).fontSize(13).font('Helvetica-Bold').text(text);
    doc.moveDown(0.3);
};

export const buildDocumentationExport = async (
    project: any,
    organisationName: string,
    plannedRegions: string[],
    from?: string,
    to?: string
): Promise<{ buffer: Buffer; fileName: string }> => {
    const end = to ? new Date(`${to}T23:59:59`) : new Date();
    const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await AnalyticsService.getProjectMetrics(project, start, end);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const donePromise = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    // ---- Header ----
    doc.fillColor(DARK).fontSize(20).font('Helvetica-Bold').text('Project Documentation');
    doc.fillColor(PRIMARY).fontSize(13).font('Helvetica-Bold').text(project.name);
    doc.moveDown(0.5);

    // ---- Project information (project-wide facts, not period-filtered) ----
    sectionTitle(doc, 'Project Information');
    fieldRow(doc, 'Organisation:', organisationName);
    fieldRow(doc, 'Description:', project.description || '');
    fieldRow(doc, 'Country:', project.country || '');
    fieldRow(doc, 'Target regions:', plannedRegions.length ? plannedRegions.join(', ') : 'None specified');
    fieldRow(doc, 'Start date:', formatDate(project.start_date));
    fieldRow(doc, 'End date:', formatDate(project.end_date));
    fieldRow(doc, 'Status:', project.status);
    fieldRow(doc, 'Target families:', String(project.target_families ?? '—'));

    // ---- Project summary (the four scorecard metrics, numbers only —
    // charts/visuals belong in Project_Charts.pdf, not duplicated here) ----
    sectionTitle(doc, 'Project Summary');
    fieldRow(doc, 'Beneficiary target achievement:', `${metrics.target_achievement.validated} / ${metrics.target_achievement.target} (${metrics.target_achievement.percent}%)`);
    fieldRow(doc, 'Geographic coverage:', `${metrics.geographic_coverage.covered_count} / ${metrics.geographic_coverage.planned_count} regions (${metrics.geographic_coverage.percent}%)`);
    fieldRow(doc, 'Assistance coverage:', `${metrics.assistance_gap.assisted_families} / ${metrics.assistance_gap.validated_families} families (${metrics.assistance_gap.percent}%)`);
    fieldRow(doc, 'Validation status:', `${metrics.validation_progress.validated} validated, ${metrics.validation_progress.pending} pending, ${metrics.validation_progress.rejected} rejected`);

    // ---- Reporting period ----
    sectionTitle(doc, 'Reporting Period');
    doc.fillColor(DARK).fontSize(11).font('Helvetica').text(`${formatDate(start)} – ${formatDate(end)}`);

    doc.end();

    const buffer = await donePromise;
    const safeProjectName = project.name.replace(/[^a-z0-9]+/gi, '_');
    const periodSuffix = from && to ? `_${from}_to_${to}` : '';
    const fileName = `Project_Documentation_${safeProjectName}${periodSuffix}.pdf`;

    return { buffer, fileName };
};