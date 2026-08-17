import PDFDocument from 'pdfkit';
import { AnalyticsService } from '../../analytics/analytics.service.js';

const COLORS = {
    primary: '#4f46e5',
    primaryLight: '#eef2ff',
    dark: '#111827',
    text: '#374151',
    muted: '#9ca3af',
    border: '#e5e7eb',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
};

const PAGE_WIDTH = 495;
const MARGIN = 50;
const PAGE_BOTTOM = 792 - 50;

const formatDate = (date?: Date | string | null): string => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const shortDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const resetX = (doc: PDFKit.PDFDocument) => { doc.x = MARGIN; };

const ensureSpace = (doc: PDFKit.PDFDocument, neededHeight: number) => {
    if (doc.y + neededHeight > PAGE_BOTTOM) {
        doc.addPage();
        doc.y = 50;
        resetX(doc);
    }
};

const h1 = (doc: PDFKit.PDFDocument, text: string) => {
    ensureSpace(doc, 50);
    resetX(doc);
    doc.moveDown(1);
    doc.fillColor(COLORS.dark).fontSize(16).font('Helvetica-Bold').text(text, MARGIN, doc.y, { width: PAGE_WIDTH });
    doc.moveTo(MARGIN, doc.y + 4).lineTo(MARGIN + PAGE_WIDTH, doc.y + 4).strokeColor(COLORS.border).lineWidth(1).stroke();
    doc.moveDown(0.6);
    resetX(doc);
};

const h2 = (doc: PDFKit.PDFDocument, text: string) => {
    ensureSpace(doc, 30);
    resetX(doc);
    doc.moveDown(0.5);
    doc.fillColor(COLORS.primary).fontSize(11.5).font('Helvetica-Bold').text(text.toUpperCase(), MARGIN, doc.y, { width: PAGE_WIDTH, characterSpacing: 0.3 });
    doc.moveDown(0.3);
    resetX(doc);
    doc.font('Helvetica').fillColor(COLORS.text);
};

const bodyText = (doc: PDFKit.PDFDocument, text: string) => {
    resetX(doc);
    ensureSpace(doc, 30);
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.text).text(text, MARGIN, doc.y, { width: PAGE_WIDTH, align: 'justify', lineGap: 3 });
    doc.moveDown(0.3);
    resetX(doc);
};

const progressBar = (doc: PDFKit.PDFDocument, width: number, percent: number, label: string) => {
    resetX(doc);
    ensureSpace(doc, 40);
    const clamped = Math.max(0, Math.min(100, percent));
    const color = clamped >= 75 ? COLORS.success : clamped >= 40 ? COLORS.warning : COLORS.danger;
    const x = MARGIN, y = doc.y;
    doc.roundedRect(x, y, width, 16, 4).fill(COLORS.border);
    doc.roundedRect(x, y, (width * clamped) / 100, 16, 4).fill(color);
    doc.fillColor(COLORS.dark).fontSize(9).font('Helvetica-Bold').text(`${clamped}%`, x + width + 10, y + 3);
    doc.y = y + 20;
    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica').text(label, x, doc.y, { width });
    doc.moveDown(0.6);
    resetX(doc);
};

// 2x2 grid of aligned stat cards — replaces the old stacked-text approach.
const statGrid = (doc: PDFKit.PDFDocument, stats: { value: string; label: string; color?: string }[]) => {
    resetX(doc);
    const cardHeight = 64;
    const cardWidth = (PAGE_WIDTH - 20) / 2;
    ensureSpace(doc, cardHeight * Math.ceil(stats.length / 2) + 16 * (Math.ceil(stats.length / 2) - 1) + 10);

    const startY = doc.y;
    stats.forEach((s, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = MARGIN + col * (cardWidth + 20);
        const y = startY + row * (cardHeight + 16);

        doc.roundedRect(x, y, cardWidth, cardHeight, 8).fillAndStroke(COLORS.primaryLight, COLORS.border);
        doc.fillColor(s.color || COLORS.primary).fontSize(20).font('Helvetica-Bold').text(s.value, x, y + 12, { width: cardWidth, align: 'center' });
        doc.fillColor(COLORS.muted).fontSize(8.5).font('Helvetica').text(s.label.toUpperCase(), x, y + 38, { width: cardWidth, align: 'center', characterSpacing: 0.3 });
    });

    doc.y = startY + Math.ceil(stats.length / 2) * (cardHeight + 16);
    resetX(doc);
};

// Proper bar chart: gridlines, y-axis labels, baseline, alternating
// x-axis labels to avoid overlap on long ranges.
const barChart = (
    doc: PDFKit.PDFDocument,
    data: { label: string; value: number }[],
    options: { height?: number; color?: string; yLabel?: string } = {}
) => {
    resetX(doc);
    const height = options.height ?? 200;
    const color = options.color ?? COLORS.primary;
    const chartWidth = PAGE_WIDTH - 40; // leave room for y-axis labels
    ensureSpace(doc, height + 50);

    const chartX = MARGIN + 40;
    const chartY = doc.y;
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const gridLines = 4;

    // gridlines + y-axis labels
    doc.fontSize(7.5).font('Helvetica').fillColor(COLORS.muted);
    for (let i = 0; i <= gridLines; i++) {
        const gy = chartY + height - (height / gridLines) * i;
        const value = Math.round((maxValue / gridLines) * i);
        doc.moveTo(chartX, gy).lineTo(chartX + chartWidth, gy).strokeColor(COLORS.border).lineWidth(0.5).stroke();
        doc.text(String(value), MARGIN, gy - 4, { width: 32, align: 'right' });
    }

    // bars
    const barGap = 4;
    const barWidth = Math.max(2, chartWidth / data.length - barGap);
    data.forEach((point, i) => {
        const barHeight = (point.value / maxValue) * height;
        const x = chartX + i * (barWidth + barGap);
        const y = chartY + height - barHeight;
        doc.rect(x, y, barWidth, Math.max(barHeight, 1)).fill(color);
    });

    // baseline (drawn over gridlines for a crisp bottom edge)
    doc.moveTo(chartX, chartY + height).lineTo(chartX + chartWidth, chartY + height).strokeColor(COLORS.dark).lineWidth(1).stroke();

    // x-axis labels — show at most ~6 to avoid overlap
    const labelStep = Math.max(1, Math.ceil(data.length / 6));
    doc.fontSize(7.5).fillColor(COLORS.muted).font('Helvetica');
    data.forEach((point, i) => {
        if (i % labelStep !== 0 && i !== data.length - 1) return;
        const x = chartX + i * (barWidth + barGap);
        doc.text(shortDate(point.label), x - 10, chartY + height + 6, { width: barWidth + 20, align: 'center' });
    });

    doc.y = chartY + height + 22;
    resetX(doc);
};

// Horizontal region bar — used for geographic coverage
const regionBar = (doc: PDFKit.PDFDocument, label: string, covered: boolean) => {
    resetX(doc);
    ensureSpace(doc, 24);
    const y = doc.y;
    doc.fillColor(COLORS.dark).fontSize(10).font('Helvetica').text(label, MARGIN, y + 2, { width: 90 });
    const barWidth = 300;
    doc.roundedRect(MARGIN + 100, y, barWidth, 14, 3).fill(covered ? COLORS.primary : COLORS.border);
    doc.fillColor(covered ? COLORS.success : COLORS.muted).fontSize(9).font('Helvetica-Bold')
        .text(covered ? 'Covered' : 'Not covered', MARGIN + 100 + barWidth + 10, y + 2);
    doc.y = y + 24;
    resetX(doc);
};

export const buildAnalyticsExport = async (
    project: any,
    from?: string,
    to?: string
): Promise<{ buffer: Buffer; fileName: string }> => {
    const end = to ? new Date(`${to}T23:59:59`) : new Date();
    const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await AnalyticsService.getProjectMetrics(project, start, end);

    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    const donePromise = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    // ---- Header ----
    doc.fillColor(COLORS.dark).fontSize(20).font('Helvetica-Bold').text('Project Charts', MARGIN, 50, { width: PAGE_WIDTH });
    resetX(doc);
    doc.fillColor(COLORS.muted).fontSize(11).font('Helvetica').text(project.name, MARGIN, doc.y, { width: PAGE_WIDTH });
    resetX(doc);
    doc.fillColor(COLORS.muted).fontSize(9).text(`Reporting period: ${formatDate(start)} – ${formatDate(end)}`, MARGIN, doc.y, { width: PAGE_WIDTH });
    resetX(doc);
    doc.moveDown(0.8);

    // ---- Headline stat grid ----
    statGrid(doc, [
        { value: `${metrics.target_achievement.percent}%`, label: 'Target Achieved' },
        { value: `${metrics.geographic_coverage.percent}%`, label: 'Geographic Coverage' },
        { value: `${metrics.assistance_gap.percent}%`, label: 'Assistance Coverage' },
        { value: `${metrics.validation_progress.percent}%`, label: 'Data Validated' },
    ]);

    // ---- Beneficiary Target Achievement ----
    h1(doc, 'Beneficiary Target Achievement');
    bodyText(doc, `${metrics.target_achievement.validated.toLocaleString()} of ${metrics.target_achievement.target.toLocaleString()} targeted families have been validated.`);
    progressBar(doc, 350, metrics.target_achievement.percent, 'of target');

    // ---- Geographic Coverage ----
    h1(doc, 'Geographic Coverage');
    bodyText(doc, `${metrics.geographic_coverage.covered_count} of ${metrics.geographic_coverage.planned_count} targeted regions have recorded project activity.`);
    progressBar(doc, 350, metrics.geographic_coverage.percent, 'regions covered');
    doc.moveDown(0.4);

    if (metrics.geographic_coverage.regions.length > 0) {
        metrics.geographic_coverage.regions.forEach((r: any) => regionBar(doc, r.region, r.covered));
    } else {
        doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text('No target regions specified for this project.', MARGIN, doc.y, { width: PAGE_WIDTH });
        resetX(doc);
    }

    // ---- Beneficiary -> Assistance Gap ----
    h1(doc, 'Beneficiary \u2192 Assistance Gap');
    statGrid(doc, [
        { value: metrics.assistance_gap.validated_families.toLocaleString(), label: 'Validated Families' },
        { value: metrics.assistance_gap.assisted_families.toLocaleString(), label: 'Assisted Families', color: COLORS.success },
        { value: metrics.assistance_gap.awaiting_assistance.toLocaleString(), label: 'Awaiting Assistance', color: COLORS.warning },
        { value: `${metrics.assistance_gap.percent}%`, label: 'Assistance Coverage' },
    ]);
    progressBar(doc, 350, metrics.assistance_gap.percent, 'assistance coverage among validated families');

    // ---- Validation Progress ----
    h1(doc, 'Data Validation');
    progressBar(doc, 350, metrics.validation_progress.percent, 'validated');
    statGrid(doc, [
        { value: metrics.validation_progress.validated.toLocaleString(), label: 'Validated', color: COLORS.success },
        { value: metrics.validation_progress.pending.toLocaleString(), label: 'Pending', color: COLORS.warning },
        { value: metrics.validation_progress.rejected.toLocaleString(), label: 'Rejected', color: COLORS.danger },
        { value: `${metrics.validation_progress.percent}%`, label: 'Validation Rate' },
    ]);

    // ---- Project Activity Over Time ----
    h1(doc, 'Project Activity Over Time');
    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text('Deliveries per day', MARGIN, doc.y, { width: PAGE_WIDTH });
    resetX(doc);
    doc.moveDown(0.4);

    const activity = (metrics.activity_over_time as { date: string; deliveries: number }[]);
    if (activity.length === 0) {
        doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text('No delivery activity recorded in this period.', MARGIN, doc.y, { width: PAGE_WIDTH });
        resetX(doc);
    } else {
        barChart(doc, activity.map((a) => ({ label: a.date, value: a.deliveries })), { color: COLORS.primary });
    }

    doc.end();

    const buffer = await donePromise;
    const safeProjectName = project.name.replace(/[^a-z0-9]+/gi, '_');
    const periodSuffix = from && to ? `_${from}_to_${to}` : '';
    const fileName = `Project_Charts_${safeProjectName}${periodSuffix}.pdf`;

    return { buffer, fileName };
};