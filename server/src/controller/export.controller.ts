import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import * as XLSX from 'xlsx';
import {
    BeneficiaryModel,
    BeneficiaryMemberModel,
    DeliveryModel,
    DeliveryItemModel,
    ProjectModel,
    MembershipModel,
    UserModel,
    AssistanceModel,
    AssistanceTypeModel
} from '../models/index.js';
import { logAudit } from '../utils/auditLogger.js';

const ExportController = {

    exportBeneficiaries: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;

        console.log("Export Beneficiaries --> Role:", userRole);

        try {
            // Only admin can export
            if (userRole !== 'admin') {
                return res.status(403).json({
                    type: 'error',
                    message: 'admin_role_required'
                });
            }

            const period = (req.query.period as string) || 'all';

            const whereClause: any = {};

            // Apply date filter based on period
            if (period !== 'all') {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                whereClause.created_at = {};

                switch (period) {
                    case 'today':
                        whereClause.created_at[Op.gte] = today;
                        whereClause.created_at[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                        break;
                    case 'this_week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        whereClause.created_at[Op.gte] = weekStart;
                        break;
                    case 'this_month':
                        whereClause.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'this_year':
                        whereClause.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            }

            // Fetch beneficiaries
            const beneficiaries = await BeneficiaryModel.findAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name']
                    },
                    {
                        model: BeneficiaryMemberModel,
                        as: 'members',
                        attributes: ['id']
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [
                            {
                                model: UserModel,
                                as: 'user',
                                attributes: ['name']
                            }
                        ]
                    }
                ]
            });

            // Prepare data for Excel
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
                    'Created Date': new Date(beneficiary.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    'Validation Status': beneficiary.review_status.toUpperCase(),
                    'Reviewed Date': beneficiary.reviewed_at 
                        ? new Date(beneficiary.reviewed_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })
                        : '-',
                    'Sync Source': beneficiary.sync_source.toUpperCase()
                };
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);

            // Set column widths
            const colWidths = [
                { wch: 5 },   // #
                { wch: 15 },  // Family Code
                { wch: 25 },  // Head of Household
                { wch: 15 },  // Phone
                { wch: 15 },  // Region
                { wch: 15 },  // Village
                { wch: 25 },  // Project
                { wch: 18 },  // Number of Members
                { wch: 20 },  // Created By
                { wch: 15 },  // Created Date
                { wch: 18 },  // Validation Status
                { wch: 15 },  // Reviewed Date
                { wch: 12 }   // Sync Source
            ];
            ws['!cols'] = colWidths;

            // Style the header row
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress]) continue;
                
                ws[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4F46E5" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaries');

            // Add summary sheet
            const summary = [
                { 'Metric': 'Total Records', 'Value': beneficiaries.length },
                { 'Metric': 'Export Period', 'Value': period.replace('_', ' ').toUpperCase() },
                { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString('en-US') },
                { 'Metric': 'Exported By', 'Value': authUser?.role || 'Admin' }
            ];

            const wsSummary = XLSX.utils.json_to_sheet(summary);
            wsSummary['!cols'] = [{ wch: 20 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

            // Generate buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

            // Log audit
            await logAudit({
                req,
                action: 'beneficiary.exported',
                entityType: 'beneficiary',
                metadata: {
                    period,
                    count: beneficiaries.length
                }
            });

            // Set response headers
            const filename = `Beneficiaries_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);

            res.status(200).send(buffer);

        } catch (error) {
            console.error("Export Beneficiaries error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    exportDeliveries: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;

        console.log("Export Deliveries --> Role:", userRole);

        try {
            // Only admin can export
            if (userRole !== 'admin') {
                return res.status(403).json({
                    type: 'error',
                    message: 'admin_role_required'
                });
            }

            const period = (req.query.period as string) || 'all';

            const whereClause: any = {};

            // Apply date filter based on period
            if (period !== 'all') {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                whereClause.created_at = {};

                switch (period) {
                    case 'today':
                        whereClause.created_at[Op.gte] = today;
                        whereClause.created_at[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                        break;
                    case 'this_week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        whereClause.created_at[Op.gte] = weekStart;
                        break;
                    case 'this_month':
                        whereClause.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'this_year':
                        whereClause.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            }

            // Fetch deliveries
            const deliveries = await DeliveryModel.findAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name']
                    },
                    {
                        model: BeneficiaryModel,
                        as: 'beneficiary',
                        attributes: ['id', 'family_code', 'head_name']
                    },
                    {
                        model: DeliveryItemModel,
                        as: 'items',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name'],
                                include: [
                                    {
                                        model: AssistanceTypeModel,
                                        as: 'assistanceType',
                                        attributes: ['name', 'unit']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [
                            {
                                model: UserModel,
                                as: 'user',
                                attributes: ['name']
                            }
                        ]
                    }
                ]
            });

            // Prepare data for Excel (one row per delivery item)
            const data: any[] = [];
            let rowNumber = 1;

            deliveries.forEach(d => {
                const delivery: any = d.toJSON();
                
                if (delivery.items && delivery.items.length > 0) {
                    delivery.items.forEach((item: any) => {
                        data.push({
                            '#': rowNumber++,
                            'Delivery ID': `#${delivery.uid}`,
                            'Project': delivery.project?.name || '-',
                            'Beneficiary': delivery.beneficiary?.head_name || '-',
                            'Family Code': delivery.beneficiary?.family_code || '-',
                            'Assistance Type': item.assistance?.assistanceType?.name || '-',
                            'Assistance Name': item.assistance?.name || '-',
                            'Quantity': item.quantity,
                            'Unit': item.assistance?.assistanceType?.unit || '-',
                            'Delivery Date': new Date(delivery.delivery_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }),
                            'Enumerator': delivery.createdBy?.user?.name || '-',
                            'Validation Status': delivery.review_status.toUpperCase(),
                            'Reviewed Date': delivery.reviewed_at 
                                ? new Date(delivery.reviewed_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })
                                : '-',
                            'Notes': delivery.notes || '-'
                        });
                    });
                } else {
                    data.push({
                        '#': rowNumber++,
                        'Delivery ID': `#${delivery.uid}`,
                        'Project': delivery.project?.name || '-',
                        'Beneficiary': delivery.beneficiary?.head_name || '-',
                        'Family Code': delivery.beneficiary?.family_code || '-',
                        'Assistance Type': '-',
                        'Assistance Name': '-',
                        'Quantity': 0,
                        'Unit': '-',
                        'Delivery Date': new Date(delivery.delivery_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        'Enumerator': delivery.createdBy?.user?.name || '-',
                        'Validation Status': delivery.review_status.toUpperCase(),
                        'Reviewed Date': delivery.reviewed_at 
                            ? new Date(delivery.reviewed_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                            : '-',
                        'Notes': delivery.notes || '-'
                    });
                }
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);

            // Set column widths
            const colWidths = [
                { wch: 5 },   // #
                { wch: 12 },  // Delivery ID
                { wch: 25 },  // Project
                { wch: 25 },  // Beneficiary
                { wch: 15 },  // Family Code
                { wch: 18 },  // Assistance Type
                { wch: 25 },  // Assistance Name
                { wch: 10 },  // Quantity
                { wch: 8 },   // Unit
                { wch: 15 },  // Delivery Date
                { wch: 20 },  // Enumerator
                { wch: 18 },  // Validation Status
                { wch: 15 },  // Reviewed Date
                { wch: 30 }   // Notes
            ];
            ws['!cols'] = colWidths;

            // Style the header row
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress]) continue;
                
                ws[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4F46E5" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Deliveries');

            // Add summary sheet
            const summary = [
                { 'Metric': 'Total Deliveries', 'Value': deliveries.length },
                { 'Metric': 'Total Items', 'Value': data.length },
                { 'Metric': 'Export Period', 'Value': period.replace('_', ' ').toUpperCase() },
                { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString('en-US') },
                { 'Metric': 'Exported By', 'Value': authUser?.role || 'Admin' }
            ];

            const wsSummary = XLSX.utils.json_to_sheet(summary);
            wsSummary['!cols'] = [{ wch: 20 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

            // Generate buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

            // Log audit
            await logAudit({
                req,
                action: 'delivery.exported',
                entityType: 'delivery',
                metadata: {
                    period,
                    deliveries_count: deliveries.length,
                    items_count: data.length
                }
            });

            // Set response headers
            const filename = `Deliveries_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);

            res.status(200).send(buffer);

        } catch (error) {
            console.error("Export Deliveries error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    }
};

export default ExportController;