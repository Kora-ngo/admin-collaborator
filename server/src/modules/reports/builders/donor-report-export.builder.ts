import PDFDocument from 'pdfkit';
import { AnalyticsService } from '../../analytics/analytics.service.js';

const DARK = '#111827';
const MUTED = '#6b7280';
const PRIMARY = '#4f46e5';
const LIGHT_BG = '#f5f5ff';

const formatDate = (date?: Date | string | null, style: 'short' | 'long' = 'short'): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return style === 'long'
        ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : d.toISOString().split('T')[0]!;
};

const monthYear = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

let pageNumber = 0;
const addFooter = (doc: PDFKit.PDFDocument, organisationName: string) => {
    pageNumber += 1;
    const bottom = doc.page.height - 40;
    doc.fontSize(8).fillColor(MUTED).font('Helvetica')
        .text(organisationName, 50, bottom, { width: 250, align: 'left' })
        .text(`Page ${pageNumber}`, doc.page.width - 100, bottom, { width: 50, align: 'right' });
};

const sectionHeading = (doc: PDFKit.PDFDocument, text: string) => {
    doc.moveDown(1);
    doc.fillColor(PRIMARY).fontSize(14).font('Helvetica-Bold').text(text.toUpperCase(), { characterSpacing: 0.5 });
    doc.moveTo(doc.x, doc.y + 4).lineTo(doc.x + 495, doc.y + 4).strokeColor(PRIMARY).lineWidth(1.5).stroke();
    doc.moveDown(0.8);
    doc.font('Helvetica').fillColor(DARK);
};

const statCard = (doc: PDFKit.PDFDocument, x: number, y: number, width: number, value: string, label: string) => {
    doc.roundedRect(x, y, width, 60, 6).fill(LIGHT_BG);
    doc.fillColor(PRIMARY).fontSize(20).font('Helvetica-Bold').text(value, x, y + 10, { width, align: 'center' });
    doc.fillColor(MUTED).fontSize(9).font('Helvetica').text(label, x, y + 36, { width, align: 'center' });
};

export const buildDonorReportExport = async (
    project: any,
    organisationName: string,
    from?: string,
    to?: string,
    executiveSummary?: string,
    narrativeHighlights?: string[]
): Promise<{ buffer: Buffer; fileName: string }> => {
    pageNumber = 0;

    const end = to ? new Date(`${to}T23:59:59`) : new Date();
    const start = from ? new Date(from) : new Date(project.start_date || end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await AnalyticsService.getProjectMetrics(project, start, end);

    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const donePromise = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    // ============================================================
    // Cover page
    // ============================================================
    doc.rect(0, 0, doc.page.width, 180).fill(PRIMARY);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica').text(organisationName.toUpperCase(), 50, 50, { characterSpacing: 1 });
    doc.fontSize(26).font('Helvetica-Bold').text('Donor Report', 50, 90);
    doc.fontSize(13).font('Helvetica').text(project.name, 50, 128, { width: 495 });

    doc.moveDown(4);
    doc.fillColor(DARK).fontSize(10).font('Helvetica');
    doc.text(`Reporting period: ${formatDate(start, 'long')} \u2013 ${formatDate(end, 'long')}`, 50, 220);
    doc.text(`Report generated: ${formatDate(new Date(), 'long')}`, 50, 236);

    // Snapshot cards on the cover
    const cardY = 280;
    const cardWidth = 110;
    const gap = 15;
    statCard(doc, 50, cardY, cardWidth, `${metrics.target_achievement.percent}%`, 'Target Achieved');
    statCard(doc, 50 + (cardWidth + gap), cardY, cardWidth, `${metrics.geographic_coverage.percent}%`, 'Geographic Coverage');
    statCard(doc, 50 + 2 * (cardWidth + gap), cardY, cardWidth, `${metrics.assistance_gap.percent}%`, 'Assistance Coverage');
    statCard(doc, 50 + 3 * (cardWidth + gap), cardY, cardWidth, `${metrics.validation_progress.percent}%`, 'Data Validated');

    addFooter(doc, organisationName);

    // ============================================================
    // Executive Summary — human-written only, never fabricated
    // ============================================================
    doc.addPage();
    sectionHeading(doc, 'Executive Summary');

    if (executiveSummary) {
        doc.fontSize(10.5).font('Helvetica').fillColor(DARK).text(executiveSummary, { align: 'justify', lineGap: 3 });
    } else {
        doc.fontSize(10).font('Helvetica-Oblique').fillColor(MUTED)
            .text('No executive summary was provided for this reporting period.');
    }

    if (narrativeHighlights && narrativeHighlights.length > 0) {
        doc.moveDown(0.8);
        doc.fontSize(11).font('Helvetica-Bold').fillColor(DARK).text('Highlights');
        doc.moveDown(0.3);
        narrativeHighlights.forEach((h) => {
            doc.fontSize(10).font('Helvetica').fillColor(DARK).text(`\u2022  ${h}`, { indent: 10, lineGap: 2 });
        });
    }

    // ============================================================
    // Project Overview — factual, auto-generated from real fields
    // ============================================================
    sectionHeading(doc, 'Project Overview');
    doc.fontSize(10.5).font('Helvetica').fillColor(DARK).text(
        `${project.name} is implemented by ${organisationName}` +
        (project.country ? ` in ${project.country}` : '') +
        `. The project began on ${formatDate(project.start_date, 'long')}` +
        (project.end_date ? ` and is scheduled to conclude on ${formatDate(project.end_date, 'long')}` : '') +
        (project.target_families ? `, with a target of reaching ${project.target_families.toLocaleString()} families.` : '.'),
        { align: 'justify', lineGap: 3 }
    );
    if (project.description) {
        doc.moveDown(0.5);
        doc.fontSize(10.5).text(project.description, { align: 'justify', lineGap: 3 });
    }

    // ============================================================
    // Results — the four metrics, written as sentences, not bars
    // ============================================================
    sectionHeading(doc, 'Results Achieved');

    doc.fontSize(10.5).font('Helvetica').fillColor(DARK).list([
        `Beneficiary reach: ${metrics.target_achievement.validated.toLocaleString()} families validated against a target of ${metrics.target_achievement.target.toLocaleString()} (${metrics.target_achievement.percent}% of target).`,
        `Geographic coverage: activities reached ${metrics.geographic_coverage.covered_count} of ${metrics.geographic_coverage.planned_count} planned regions (${metrics.geographic_coverage.percent}%).`,
        `Assistance delivery: of the validated families, ${metrics.assistance_gap.assisted_families.toLocaleString()} (${metrics.assistance_gap.percent}%) have received assistance; ${metrics.assistance_gap.awaiting_assistance.toLocaleString()} remain awaiting distribution.`,
        `Data quality: ${metrics.validation_progress.validated.toLocaleString()} records validated, ${metrics.validation_progress.pending.toLocaleString()} pending review, and ${metrics.validation_progress.rejected.toLocaleString()} rejected (${metrics.validation_progress.percent}% validation rate).`,
    ], { bulletRadius: 2, textIndent: 10, bulletIndent: 0, lineGap: 4 });

    // ============================================================
    // Methodology / Data Quality note — builds donor trust
    // ============================================================
    sectionHeading(doc, 'Methodology & Data Quality');
    doc.fontSize(10).font('Helvetica').fillColor(DARK).text(
        'Field data is collected by trained enumerators using Kora\u2019s mobile data ' +
        'collection tools and is submitted for review before being counted toward ' +
        'reported results. Only beneficiary and delivery records with an approved ' +
        'validation status are reflected in the figures above unless otherwise noted. ' +
        'This methodology ensures reported results reflect verified field activity.',
        { align: 'justify', lineGap: 3 }
    );

    addFooter(doc, organisationName);

    doc.end();

    const buffer = await donePromise;
    const safeProjectName = project.name.replace(/[^a-z0-9]+/gi, '_');
    const periodLabel = monthYear(end).replace(/\s+/g, '_');
    const fileName = `Donor_Report_${safeProjectName}_${periodLabel}.pdf`;

    return { buffer, fileName };
};