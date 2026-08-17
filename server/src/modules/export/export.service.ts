import { Op } from 'sequelize';
import * as XLSX from 'xlsx';
import { ExportRepository } from './export.repository.js';

// ============================================================
// Shared helpers
// ============================================================

const buildDateWhereClause = (period: string) => {
    const whereClause: any = {};
    if (period === 'all') return whereClause;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    whereClause.created_at = {};

    switch (period) {
        case 'today':
            whereClause.created_at[Op.gte] = today;
            whereClause.created_at[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            break;
        case 'this_week': {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            whereClause.created_at[Op.gte] = weekStart;
            break;
        }
        case 'this_month':
            whereClause.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'this_year':
            whereClause.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
            break;
    }
    return whereClause;
};

const formatDate = (date: any) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const styleHeaderRow = (ws: XLSX.WorkSheet) => {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4F46E5' } },
            alignment: { horizontal: 'center', vertical: 'center' },
        };
    }
};

const buildSummarySheet = (wb: XLSX.WorkBook, summary: { Metric: string; Value: any }[]) => {
    const wsSummary = XLSX.utils.json_to_sheet(summary);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
};


// ============================================================
// Beneficiaries export
// ============================================================

export const ExportService = {

    exportBeneficiaries: async (period: string, exportedByRole: string | undefined) => {
        const whereClause = buildDateWhereClause(period);
        const beneficiaries = await ExportRepository.findAllBeneficiaries(whereClause);

        const data = beneficiaries.map((b, index) => {
            const beneficiary: any = b.toJSON();
            return {
                '#': index + 1,
                'Family Code': beneficiary.family_code,
                'Head of Household': beneficiary.head_name,
                'Phone': beneficiary.phone || '-',
                'Region': beneficiary.region || '-',
                'Village': beneficiary.village || '-',
                'Project': beneficiary.project?.name || '-',
                'Number of Members': beneficiary.members?.length || 0,
                'Created By': beneficiary.createdBy?.user?.name || '-',
                'Created Date': formatDate(beneficiary.created_at),
                'Validation Status': beneficiary.review_status.toUpperCase(),
                'Reviewed Date': beneficiary.reviewed_at ? formatDate(beneficiary.reviewed_at) : '-',
                'Sync Source': beneficiary.sync_source.toUpperCase(),
            };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        ws['!cols'] = [
            { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            { wch: 25 }, { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 12 },
        ];
        styleHeaderRow(ws);
        XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaries');

        buildSummarySheet(wb, [
            { Metric: 'Total Records', Value: beneficiaries.length },
            { Metric: 'Export Period', Value: period.replace('_', ' ').toUpperCase() },
            { Metric: 'Export Date', Value: new Date().toLocaleDateString('en-US') },
            { Metric: 'Exported By', Value: exportedByRole || 'Admin' },
        ]);

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        const filename = `Beneficiaries_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;

        return { buffer, filename, count: beneficiaries.length };
    },


    // ============================================================
    // Deliveries export
    // ============================================================

    exportDeliveries: async (period: string, exportedByRole: string | undefined) => {
        const whereClause = buildDateWhereClause(period);
        const deliveries = await ExportRepository.findAllDeliveries(whereClause);

        const data: any[] = [];
        let rowNumber = 1;

        const baseRow = (delivery: any) => ({
            '#': rowNumber++,
            'Delivery ID': `#${delivery.uid}`,
            'Project': delivery.project?.name || '-',
            'Beneficiary': delivery.beneficiary?.head_name || '-',
            'Family Code': delivery.beneficiary?.family_code || '-',
            'Delivery Date': formatDate(delivery.delivery_date),
            'Enumerator': delivery.createdBy?.user?.name || '-',
            'Validation Status': delivery.review_status.toUpperCase(),
            'Reviewed Date': delivery.reviewed_at ? formatDate(delivery.reviewed_at) : '-',
            'Notes': delivery.notes || '-',
        });

        deliveries.forEach(d => {
            const delivery: any = d.toJSON();

            if (delivery.items && delivery.items.length > 0) {
                delivery.items.forEach((item: any) => {
                    const row = baseRow(delivery);
                    data.push({
                        '#': row['#'],
                        'Delivery ID': row['Delivery ID'],
                        'Project': row['Project'],
                        'Beneficiary': row['Beneficiary'],
                        'Family Code': row['Family Code'],
                        'Assistance Type': item.assistance?.assistanceType?.name || '-',
                        'Assistance Name': item.assistance?.name || '-',
                        'Quantity': item.quantity,
                        'Unit': item.assistance?.assistanceType?.unit || '-',
                        'Delivery Date': row['Delivery Date'],
                        'Enumerator': row['Enumerator'],
                        'Validation Status': row['Validation Status'],
                        'Reviewed Date': row['Reviewed Date'],
                        'Notes': row['Notes'],
                    });
                });
            } else {
                const row = baseRow(delivery);
                data.push({
                    '#': row['#'],
                    'Delivery ID': row['Delivery ID'],
                    'Project': row['Project'],
                    'Beneficiary': row['Beneficiary'],
                    'Family Code': row['Family Code'],
                    'Assistance Type': '-',
                    'Assistance Name': '-',
                    'Quantity': 0,
                    'Unit': '-',
                    'Delivery Date': row['Delivery Date'],
                    'Enumerator': row['Enumerator'],
                    'Validation Status': row['Validation Status'],
                    'Reviewed Date': row['Reviewed Date'],
                    'Notes': row['Notes'],
                });
            }
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        ws['!cols'] = [
            { wch: 5 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 18 },
            { wch: 25 }, { wch: 10 }, { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 30 },
        ];
        styleHeaderRow(ws);
        XLSX.utils.book_append_sheet(wb, ws, 'Deliveries');

        buildSummarySheet(wb, [
            { Metric: 'Total Deliveries', Value: deliveries.length },
            { Metric: 'Total Items', Value: data.length },
            { Metric: 'Export Period', Value: period.replace('_', ' ').toUpperCase() },
            { Metric: 'Export Date', Value: new Date().toLocaleDateString('en-US') },
            { Metric: 'Exported By', Value: exportedByRole || 'Admin' },
        ]);

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        const filename = `Deliveries_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;

        return { buffer, filename, deliveriesCount: deliveries.length, itemsCount: data.length };
    },
};