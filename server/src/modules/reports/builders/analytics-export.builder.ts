import PDFDocument from 'pdfkit';
import { AnalyticsService } from '../../analytics/analytics.service.js';

const PRIMARY = '#4f46e5';
const MUTED = '#9ca3af';
const DARK = '#111827';

const formatDate = (date?: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]!;
};

// Simple horizontal progress bar drawn with primitives — pdfkit has no
// built-in chart support, so bars/lines are hand-drawn rectangles.
const drawProgressBar = (doc: PDFKit.PDFDocument, x: number, y: number, width: number, percent: number) => {
    const height = 14;
    const clamped = Math.max(0, Math.min(100, percent));
    doc.roundedRect(x, y, width, height, 4).fill('#f3f4f6');
    doc.roundedRect(x, y, (width * clamped) / 100, height, 4).fill(PRIMARY);
    doc.fillColor(DARK).fontSize(10).text(`${clamped}%`, x + width + 10, y + 2);
};

const sectionTitle = (doc: PDFKit.PDFDocument, text: string) => {
    doc.moveDown(0.5);
    doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text(text);
    doc.moveDown(0.3);
    doc.font('Helvetica');
};

const statLine = (doc: PDFKit.PDFDocument, label: string, value: string) => {
    doc.fillColor(MUTED).fontSize(10).text(label, { continued: true });
    doc.fillColor(DARK).fontSize(10).text(`  ${value}`);
};

export const buildAnalyticsExport = async (
    project: any,
    from?: string,
    to?: string
): Promise<{ buffer: Buffer; fileName: string }> => {
    // Default window: last 30 days, if the request didn't specify one —
    // same fallback used by the Analytics dashboard's own default.
    const end = to ? new Date(`${to}T23:59:59`) : new Date();
    const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await AnalyticsService.getProjectMetrics(project, start, end);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const donePromise = new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // ---- Header ----
    doc.fillColor(DARK).fontSize(20).font('Helvetica-Bold').text('Project Charts');
    doc.fillColor(MUTED).fontSize(11).font('Helvetica').text(project.name);
    doc.fillColor(MUTED).fontSize(9).text(`Reporting period: ${formatDate(start)} – ${formatDate(end)}`);
    doc.moveDown(1);

    // ============================================================
    // Page 1 — Beneficiary Target Achievement + Geographic Coverage
    // ============================================================
    sectionTitle(doc, 'Beneficiary Target Achievement');
    statLine(doc, 'Validated families', `${metrics.target_achievement.validated} / ${metrics.target_achievement.target}`);
    doc.moveDown(0.3);
    drawProgressBar(doc, doc.x, doc.y, 350, metrics.target_achievement.percent);
    doc.moveDown(1.5);

    sectionTitle(doc, 'Geographic Coverage');
    statLine(doc, 'Regions covered', `${metrics.geographic_coverage.covered_count} / ${metrics.geographic_coverage.planned_count}`);
    doc.moveDown(0.3);
    drawProgressBar(doc, doc.x, doc.y, 350, metrics.geographic_coverage.percent);
    doc.moveDown(0.8);

    metrics.geographic_coverage.regions.forEach((r: any) => {
        const y = doc.y;
        doc.fillColor(DARK).fontSize(10).text(r.region, doc.x, y, { continued: false, width: 80 });
        const barWidth = 200;
        doc.roundedRect(doc.x + 90, y, barWidth, 12, 3).fill(r.covered ? PRIMARY : '#e5e7eb');
        doc.fillColor(MUTED).fontSize(9).text(r.covered ? 'Covered' : 'Not covered', doc.x + 90 + barWidth + 8, y + 1);
        doc.moveDown(0.6);
    });

    // ============================================================
    // Page 2 — Assistance Gap + Validation Progress
    // ============================================================
    doc.addPage();
    doc.fillColor(DARK).fontSize(16).font('Helvetica-Bold').text('Project Charts (continued)');
    doc.moveDown(0.5);

    sectionTitle(doc, 'Beneficiary \u2192 Assistance Gap');
    statLine(doc, 'Validated families', `${metrics.assistance_gap.validated_families}`);
    statLine(doc, 'Assisted families', `${metrics.assistance_gap.assisted_families}`);
    statLine(doc, 'Awaiting assistance', `${metrics.assistance_gap.awaiting_assistance}`);
    doc.moveDown(0.3);
    drawProgressBar(doc, doc.x, doc.y, 350, metrics.assistance_gap.percent);
    doc.moveDown(1.5);

    sectionTitle(doc, 'Data Validation');
    drawProgressBar(doc, doc.x, doc.y, 350, metrics.validation_progress.percent);
    doc.moveDown(1);

    const vp = metrics.validation_progress;
    const colWidth = 150;
    const startX = doc.x;
    const startY = doc.y;
    [
        { label: 'Validated', value: vp.validated },
        { label: 'Pending', value: vp.pending },
        { label: 'Rejected', value: vp.rejected },
    ].forEach((stat, i) => {
        doc.fillColor(DARK).fontSize(16).font('Helvetica-Bold').text(String(stat.value), startX + i * colWidth, startY, { width: colWidth, align: 'center' });
        doc.fillColor(MUTED).fontSize(9).font('Helvetica').text(stat.label, startX + i * colWidth, startY + 22, { width: colWidth, align: 'center' });
    });
    doc.y = startY + 50;

    // ============================================================
    // Page 3 — Project Activity Over Time
    // ============================================================
    doc.addPage();
    doc.fillColor(DARK).fontSize(16).font('Helvetica-Bold').text('Project Activity Over Time');
    doc.fillColor(MUTED).fontSize(10).font('Helvetica').text('Deliveries per day');
    doc.moveDown(1);

    const activity = metrics.activity_over_time as { date: string; deliveries: number }[];

    if (activity.length === 0) {
        doc.fillColor(MUTED).fontSize(10).text('No delivery activity recorded in this period.');
    } else {
        const chartX = doc.x;
        const chartY = doc.y;
        const chartWidth = 480;
        const chartHeight = 200;
        const maxValue = Math.max(...activity.map((a) => a.deliveries), 1);
        const barGap = 4;
        const barWidth = Math.max(2, chartWidth / activity.length - barGap);

        // baseline
        doc.moveTo(chartX, chartY + chartHeight).lineTo(chartX + chartWidth, chartY + chartHeight).strokeColor('#e5e7eb').stroke();

        activity.forEach((point, i) => {
            const barHeight = (point.deliveries / maxValue) * (chartHeight - 10);
            const x = chartX + i * (barWidth + barGap);
            const y = chartY + chartHeight - barHeight;
            doc.rect(x, y, barWidth, barHeight).fill(PRIMARY);
        });

        // x-axis labels: first, middle, last date only, to avoid overlap
        doc.fillColor(MUTED).fontSize(8).font('Helvetica');
        const labelPoints = [0, Math.floor(activity.length / 2), activity.length - 1];
        [...new Set(labelPoints)].forEach((idx) => {
            const point = activity[idx];
            const x = chartX + idx * (barWidth + barGap);
            doc.text(point!.date, x, chartY + chartHeight + 6, { width: 60 });
        });

        doc.y = chartY + chartHeight + 30;
    }

    doc.end();

    const buffer = await donePromise;
    const safeProjectName = project.name.replace(/[^a-z0-9]+/gi, '_');
    const periodSuffix = from && to ? `_${from}_to_${to}` : '';
    const fileName = `Project_Charts_${safeProjectName}${periodSuffix}.pdf`;

    return { buffer, fileName };
};