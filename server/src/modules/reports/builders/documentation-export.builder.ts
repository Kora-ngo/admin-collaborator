import PDFDocument from 'pdfkit';
import { AnalyticsService } from '../../analytics/analytics.service.js';
import { DocumentationExportRepository } from '../queries/documentation-export.repository.js';

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

const num = (n: number) => n.toLocaleString('en-US');
const resetX = (doc: PDFKit.PDFDocument) => { doc.x = MARGIN; };

// No footer / page-number system — removed per request. Page breaks are
// now purely content-driven via ensureSpace, with nothing injected onto
// a page that would otherwise be empty.
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

const bulletList = (doc: PDFKit.PDFDocument, items: string[], color = COLORS.text) => {
    resetX(doc);
    items.forEach((item) => {
        ensureSpace(doc, 20);
        doc.fillColor(color).fontSize(10).font('Helvetica').text(`•  ${item}`, MARGIN + 4, doc.y, { width: PAGE_WIDTH - 8, lineGap: 2 });
        resetX(doc);
    });
};

const calloutBox = (doc: PDFKit.PDFDocument, text: string) => {
    resetX(doc);
    const textHeight = doc.heightOfString(text, { width: PAGE_WIDTH - 24 });
    const boxHeight = textHeight + 16;
    ensureSpace(doc, boxHeight + 8);
    const x = MARGIN, y = doc.y;
    doc.rect(x, y, 3, boxHeight).fill(COLORS.primary);
    doc.rect(x + 3, y, PAGE_WIDTH - 3, boxHeight).fill(COLORS.primaryLight);
    doc.fillColor(COLORS.dark).fontSize(10).font('Helvetica').text(text, x + 16, y + 8, { width: PAGE_WIDTH - 32 });
    doc.y = y + boxHeight + 10;
    resetX(doc);
};

const drawTable = (
    doc: PDFKit.PDFDocument,
    columns: { label: string; width: number; align?: 'left' | 'right' | 'center' }[],
    rows: (string | number)[][],
    boldLastRow = false
) => {
    resetX(doc);
    const rowHeight = 22;
    const startX = MARGIN;

    const drawHeader = () => {
        const y = doc.y;
        doc.rect(startX, y, PAGE_WIDTH, rowHeight).fill(COLORS.primary);
        let cx = startX;
        columns.forEach((c) => {
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(c.label, cx + 8, y + 6, { width: c.width - 12, align: c.align || 'left' });
            cx += c.width;
        });
        doc.y = y + rowHeight;
        resetX(doc);
    };

    ensureSpace(doc, rowHeight * 2);
    drawHeader();

    rows.forEach((row, i) => {
        if (doc.y + rowHeight > PAGE_BOTTOM) {
            doc.addPage();
            doc.y = 50;
            resetX(doc);
            drawHeader();
        }
        const y = doc.y;
        const isLast = boldLastRow && i === rows.length - 1;
        if (isLast) doc.rect(startX, y, PAGE_WIDTH, rowHeight).fill(COLORS.primaryLight);
        else if (i % 2 === 1) doc.rect(startX, y, PAGE_WIDTH, rowHeight).fill('#f9fafb');
        doc.rect(startX, y, PAGE_WIDTH, rowHeight).strokeColor(COLORS.border).lineWidth(0.5).stroke();

        let cx = startX;
        row.forEach((val, ci) => {
            doc.fillColor(COLORS.text).fontSize(9.5).font(isLast ? 'Helvetica-Bold' : 'Helvetica')
                .text(String(val), cx + 8, y + 6, { width: columns[ci]!.width - 12, align: columns[ci]!.align || 'left' });
            cx += columns[ci]!.width;
        });
        doc.y = y + rowHeight;
        resetX(doc);
    });

    doc.moveDown(0.6);
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

export const buildDocumentationExport = async (
    project: any,
    organisationName: string,
    plannedRegions: string[],
    from?: string,
    to?: string
): Promise<{ buffer: Buffer; fileName: string }> => {
    const end = to ? new Date(`${to}T23:59:59`) : new Date();
    const start = from ? new Date(from) : new Date(project.start_date || end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [metrics, pipeline, regionRows, assistanceTypeRows, itemRows, weeklyRows] = await Promise.all([
        AnalyticsService.getProjectMetrics(project, start, end),
        DocumentationExportRepository.registrationPipeline(project.id, start, end),
        DocumentationExportRepository.regionBreakdown(project.id),
        DocumentationExportRepository.assistanceTypeBreakdown(project.id, start, end),
        DocumentationExportRepository.itemsDistributed(project.id, start, end),
        DocumentationExportRepository.weeklyActivity(project.id, start, end),
    ]);

    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    const donePromise = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    // ---- Cover ----
    doc.rect(0, 0, doc.page.width, 260).fill(COLORS.primary);
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica').text('KORA — PROJECT OVERVIEW', MARGIN, 55, { characterSpacing: 1.5 });
    doc.fontSize(24).font('Helvetica-Bold').text(project.name, MARGIN, 85, { width: PAGE_WIDTH });

    resetX(doc);
    const cardY = 300;
    const cardWidth = (PAGE_WIDTH - 20) / 2;
    const cardHeight = 64;
    const infoCards: [string, string][] = [
        ['Implementing Organization', organisationName],
        ['Project Status', project.status.charAt(0).toUpperCase() + project.status.slice(1)],
        ['Implementation Period', `${formatDate(project.start_date)} – ${formatDate(project.end_date)}`],
        ['Reporting Period', `${formatDate(start)} – ${formatDate(end)}`],
    ];
    infoCards.forEach(([label, value], i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = MARGIN + col * (cardWidth + 20);
        const y = cardY + row * (cardHeight + 16);
        doc.roundedRect(x, y, cardWidth, cardHeight, 8).fillAndStroke(COLORS.primaryLight, COLORS.border);
        doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica-Bold').text(label.toUpperCase(), x + 16, y + 14, { width: cardWidth - 32, characterSpacing: 0.5 });
        doc.fillColor(COLORS.dark).fontSize(12.5).font('Helvetica-Bold').text(value, x + 16, y + 32, { width: cardWidth - 32 });
    });
    doc.y = cardY + 2 * (cardHeight + 16) + 10;
    resetX(doc);

    // ---- 1. Project Summary ----
    doc.addPage();
    doc.y = 50;
    resetX(doc);

    h1(doc, '1. Project Summary');
    h2(doc, 'Objective');
    bodyText(doc, project.description || 'No project description has been provided.');

    h2(doc, 'Target Population');
    bodyText(doc, `The project targets ${num(project.target_families || 0)} vulnerable families across ${plannedRegions.length} region${plannedRegions.length !== 1 ? 's' : ''} of ${project.country || 'the country of operation'}.`);

    h2(doc, 'Implementation Approach');
    bodyText(doc, 'Field teams conduct beneficiary registration directly within target communities. Beneficiary information is collected through Kora\u2019s offline-first mobile application, allowing enumerators to continue working in areas with limited connectivity. Registered beneficiaries are subsequently reviewed and validated by project collaborators before being included in confirmed project figures and assistance activities.');

    // ---- 2. Project Scope ----
    h1(doc, '2. Project Scope');
    drawTable(doc,
        [{ label: 'Indicator', width: 300 }, { label: 'Target', width: 195, align: 'right' }],
        [
            ['Target families', num(project.target_families || 0)],
            ['Target regions', String(plannedRegions.length)],
            ['Project start', formatDate(project.start_date)],
            ['Project end', formatDate(project.end_date)],
        ]
    );
    h2(doc, 'Targeted Regions');
    if (plannedRegions.length > 0) bulletList(doc, plannedRegions);
    else { doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text('No target regions specified.', MARGIN, doc.y, { width: PAGE_WIDTH }); resetX(doc); }

    // ---- 3. Progress at a Glance ----
    h1(doc, '3. Progress at a Glance');
    h2(doc, 'Beneficiary Target Achievement');
    doc.fontSize(11).fillColor(COLORS.dark).font('Helvetica-Bold')
        .text(`${num(metrics.target_achievement.validated)} / ${num(metrics.target_achievement.target)} families — ${metrics.target_achievement.percent}% achieved`, MARGIN, doc.y, { width: PAGE_WIDTH });
    doc.moveDown(0.3);
    resetX(doc);
    progressBar(doc, 350, metrics.target_achievement.percent, 'of target');

    drawTable(doc,
        [{ label: 'Indicator', width: 300 }, { label: 'Number', width: 195, align: 'right' }],
        [
            ['Target families', num(project.target_families || 0)],
            ['Registered', num(pipeline.registered)],
            ['Validated', num(pipeline.validated)],
            ['Pending validation', num(pipeline.pending)],
            ['Rejected', num(pipeline.rejected)],
            ['Families assisted', num(metrics.assistance_gap.assisted_families)],
        ]
    );

    h2(doc, 'Assistance Coverage');
    bodyText(doc, `${num(metrics.assistance_gap.assisted_families)} of ${num(metrics.assistance_gap.validated_families)} validated families have received assistance — ${metrics.assistance_gap.percent}% assistance coverage among validated beneficiaries.`);

    // ---- 4. Geographic Coverage ----
    h1(doc, '4. Geographic Coverage');
    if (regionRows.length === 0) {
        doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text('No beneficiary region data recorded for this project.', MARGIN, doc.y, { width: PAGE_WIDTH });
        resetX(doc);
    } else {
        // NOTE: no per-region target exists in the schema (only a
        // project-wide target_families) — Target column shown as "—"
        // rather than an invented figure.
        const totalBeneficiaries = regionRows.reduce((s, r) => s + r.beneficiaries, 0);
        const totalAssisted = regionRows.reduce((s, r) => s + r.assisted, 0);
        drawTable(doc,
            [
                { label: 'Region', width: 140 },
                { label: 'Target', width: 90, align: 'right' },
                { label: 'Beneficiaries', width: 120, align: 'right' },
                { label: 'Assisted', width: 75, align: 'right' },
                { label: 'Coverage', width: 70, align: 'right' },
            ],
            [
                ...regionRows.map((r) => [
                    r.region, '—', num(r.beneficiaries), num(r.assisted),
                    r.beneficiaries > 0 ? `${Math.round((r.assisted / r.beneficiaries) * 100)}%` : '—',
                ]),
                ['Total', num(project.target_families || 0), num(totalBeneficiaries), num(totalAssisted),
                    totalBeneficiaries > 0 ? `${Math.round((totalAssisted / totalBeneficiaries) * 100)}%` : '—'],
            ],
            true
        );

        const lowest = [...regionRows].sort((a, b) => (a.beneficiaries ? a.assisted / a.beneficiaries : 0) - (b.beneficiaries ? b.assisted / b.beneficiaries : 0))[0];
        bodyText(doc, `${metrics.geographic_coverage.covered_count} of ${metrics.geographic_coverage.planned_count} targeted regions have recorded project activity.` +
            (lowest ? ` ${lowest.region} currently shows the lowest beneficiary assistance coverage among active regions.` : ''));
    }

    // ---- 5. Assistance Delivered ----
    h1(doc, '5. Assistance Delivered');
    if (assistanceTypeRows.length === 0) {
        doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text('No assistance deliveries recorded for this period.', MARGIN, doc.y, { width: PAGE_WIDTH });
        resetX(doc);
    } else {
        const totalDeliveries = assistanceTypeRows.reduce((s: number, r: any) => s + Number(r.deliveries), 0);
        const totalFamilies = assistanceTypeRows.reduce((s: number, r: any) => s + Number(r.families_assisted), 0);
        bodyText(doc, `During the reporting period, the project recorded ${num(totalDeliveries)} completed assistance deliveries across ${plannedRegions.length || regionRows.length} targeted region(s).`);
        drawTable(doc,
            [{ label: 'Assistance Type', width: 220 }, { label: 'Deliveries', width: 137, align: 'right' }, { label: 'Families Assisted', width: 138, align: 'right' }],
            [
                ...assistanceTypeRows.map((r: any) => [r.type, num(Number(r.deliveries)), num(Number(r.families_assisted))]),
                ['Total', num(totalDeliveries), num(totalFamilies)],
            ],
            true
        );
    }

    h2(doc, 'Main Items Distributed');
    if (itemRows.length === 0) {
        doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text('No items recorded for this period.', MARGIN, doc.y, { width: PAGE_WIDTH });
        resetX(doc);
    } else {
        drawTable(doc,
            [{ label: 'Item', width: 250 }, { label: 'Quantity', width: 130, align: 'right' }, { label: 'Unit', width: 115, align: 'left' }],
            itemRows.map((r: any) => [r.item, num(Number(r.total_quantity)), r.unit || ''])
        );
    }

    // ---- 6. Beneficiary Validation ----
    h1(doc, '6. Beneficiary Validation');
    bodyText(doc, `The project registered ${num(pipeline.registered)} beneficiaries during the reporting period. Of these, ${num(pipeline.validated)} have been validated, ${num(pipeline.pending)} are awaiting validation, and ${num(pipeline.rejected)} have been rejected.`);
    h2(doc, 'Validation Progress');
    progressBar(doc, 350, metrics.validation_progress.percent, `${metrics.validation_progress.percent}% validated`);

    // ---- 7. Project Activity ----
    h1(doc, '7. Project Activity');
    if (weeklyRows.length === 0) {
        doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text('No weekly activity recorded for this period.', MARGIN, doc.y, { width: PAGE_WIDTH });
        resetX(doc);
    } else {
        drawTable(doc,
            [{ label: 'Week', width: 120 }, { label: 'Registrations', width: 125, align: 'right' }, { label: 'Validations', width: 125, align: 'right' }, { label: 'Deliveries', width: 125, align: 'right' }],
            weeklyRows.map((w) => [w.label, num(w.registrations), num(w.validations), num(w.deliveries)])
        );
    }

    // ---- 8. Operational Attention ----
    h1(doc, '8. Operational Attention');
    const remaining = Math.max((project.target_families || 0) - metrics.target_achievement.validated, 0);
    const attentionItems: string[] = [];
    if (pipeline.pending > 0) attentionItems.push(`Pending validation: ${num(pipeline.pending)} beneficiaries remain awaiting review.`);
    if (metrics.assistance_gap.awaiting_assistance > 0) attentionItems.push(`Assistance gap: ${num(metrics.assistance_gap.awaiting_assistance)} validated beneficiaries have not yet received assistance.`);
    if (remaining > 0) attentionItems.push(`Remaining project target: ${num(remaining)} families remain to be reached to achieve the project's overall beneficiary target.`);

    if (attentionItems.length === 0) {
        doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text('No outstanding operational items at this time.', MARGIN, doc.y, { width: PAGE_WIDTH });
        resetX(doc);
    } else {
        attentionItems.forEach((item) => calloutBox(doc, item));
    }

    // ---- 9. Overall Project Status ----
    h1(doc, '9. Overall Project Status');
    ensureSpace(doc, 80);
    const bandY = doc.y;
    doc.roundedRect(MARGIN, bandY, PAGE_WIDTH, 70, 6).fill(COLORS.primary);
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
        .text(project.status.toUpperCase(), MARGIN + 15, bandY + 12, { width: PAGE_WIDTH - 30 });
    doc.fontSize(9).font('Helvetica')
        .text(`The project has reached ${num(metrics.target_achievement.validated)} of its ${num(metrics.target_achievement.target)} targeted families, representing ${metrics.target_achievement.percent}% achievement against the beneficiary target.`,
            MARGIN + 15, bandY + 34, { width: PAGE_WIDTH - 30 });
    doc.y = bandY + 85;
    resetX(doc);

    // ---- Data & Reporting Notes ----
    h2(doc, 'Data & Reporting Notes');
    bulletList(doc, [
        `This report was generated from project records available in Kora as of ${formatDate(new Date())}.`,
        'Beneficiary achievement figures are based on validated beneficiary records. Pending and rejected registrations are excluded from confirmed beneficiary achievement calculations.',
        'Assistance figures represent recorded deliveries with an approved status.',
    ], COLORS.muted);

    doc.moveDown(1);
    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Oblique')
        .text('Report generated by Kora — Offline-First Beneficiary & Aid Tracking Operating System.', MARGIN, doc.y, { width: PAGE_WIDTH });

    doc.end();

    const buffer = await donePromise;
    const safeProjectName = project.name.replace(/[^a-z0-9]+/gi, '_');
    const periodSuffix = from && to ? `_${from}_to_${to}` : '';
    const fileName = `Project_Documentation_${safeProjectName}${periodSuffix}.pdf`;

    return { buffer, fileName };
};