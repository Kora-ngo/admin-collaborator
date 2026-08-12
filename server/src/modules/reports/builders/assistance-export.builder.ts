import ExcelJS from 'exceljs';
import { AssistanceExportRepository } from '../queries/assistance-export.repository.js';

const formatDate = (date?: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]!;
};

const capitalize = (s?: string | null): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const buildAssistanceExport = async (
    projectId: number,
    projectName: string,
    from?: string,
    to?: string
): Promise<{ buffer: Buffer; fileName: string }> => {
    const rows = await AssistanceExportRepository.findForExport(projectId, from, to);

    console.log('[assistance-export] building sheet for', rows.length, 'rows');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Assistance');

    sheet.columns = [
        { header: '#', key: 'index', width: 6 },
        { header: 'Beneficiary', key: 'beneficiary', width: 22 },
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Assistance Type', key: 'assistance_type', width: 18 },
        { header: 'Item', key: 'item', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 12 },
        { header: 'Unit', key: 'unit', width: 10 },
        { header: 'Region', key: 'region', width: 16 },
        { header: 'Locality', key: 'locality', width: 16 },
        { header: 'Status', key: 'status', width: 14 },
    ];
    sheet.getRow(1).font = { bold: true };

    rows.forEach((row, i) => {
        const { item, delivery, beneficiary, assistance, assistanceType } = row;

        sheet.addRow({
            index: i + 1,
            beneficiary: beneficiary?.head_name || '',
            date: formatDate(delivery?.delivery_date),
            assistance_type: assistanceType?.name || '',
            item: assistance?.name || '',
            quantity: item.quantity,
            unit: assistanceType?.unit || '',
            region: beneficiary?.region || '',
            locality: beneficiary?.village || '',
            status: capitalize(delivery?.review_status),
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const safeProjectName = projectName.replace(/[^a-z0-9]+/gi, '_');
    const periodSuffix = from && to ? `_${from}_to_${to}` : '';
    const fileName = `Assistance_${safeProjectName}${periodSuffix}.xlsx`;

    return { buffer: Buffer.from(buffer), fileName };
};