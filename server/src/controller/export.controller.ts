import type { Request, Response } from "express";
import { Op } from "sequelize";
import BeneficiaryModel from "../models/Beneficiary.js";
import ProjectModel from "../models/project.js";
import BeneficiaryMemberModel from "../models/BeneficiaryMember.js";
import { generateCSV } from "../utils/csvGenerator.js";
import { logAudit } from "../utils/auditLogger.js";
import MembershipModel from "../models/Membership.js";
import UserModel from "../models/User.js";
import DeliveryModel from "../models/Delivery.js";
import DeliveryItemModel from "../models/DeliveryItem.js";
import AssistanceModel from "../models/Assistance.js";
import AssistanceTypeModel from "../models/AssistanceType.js";

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
                    }
                ]
            });

            // Prepare CSV headers
            const headers = [
                'Family Code',
                'Head of Household',
                'Phone',
                'Region',
                'Village',
                'Project',
                'Number of Members',
                'Created Date',
                'Validation Status',
                'Reviewed Date',
                'Sync Source'
            ];

            // Prepare CSV rows
            const rows = beneficiaries.map(b => {
                const data: any = b.toJSON();
                return [
                    data.family_code,
                    data.head_name,
                    data.phone || '-',
                    data.region || '-',
                    data.village || '-',
                    data.project?.name || '-',
                    data.members?.length || 0,
                    new Date(data.created_at).toLocaleDateString('en-US'),
                    data.review_status,
                    data.reviewed_at ? new Date(data.reviewed_at).toLocaleDateString('en-US') : '-',
                    data.sync_source
                ];
            });

            // Generate CSV
            const csv = generateCSV(headers, rows);

            // Log audit
            await logAudit({
                req,
                action: 'beneficiary - exported',
                entityType: 'beneficiary',
                metadata: {
                    period,
                    count: beneficiaries.length
                }
            });

            // Set response headers
            const filename = `beneficiaries_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            res.status(200).send(csv);

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

            // Prepare CSV headers
            const headers = [
                'Delivery ID',
                'Project',
                'Beneficiary',
                'Family Code',
                'Assistance Type',
                'Assistance Name',
                'Quantity',
                'Unit',
                'Delivery Date',
                'Enumerator',
                'Validation Status',
                'Reviewed Date',
                'Notes'
            ];

            // Prepare CSV rows (one row per delivery item)
            const rows: any[] = [];

            deliveries.forEach(d => {
                const data: any = d.toJSON();
                
                if (data.items && data.items.length > 0) {
                    // Create a row for each item
                    data.items.forEach((item: any) => {
                        rows.push([
                            data.uid,
                            data.project?.name || '-',
                            data.beneficiary?.head_name || '-',
                            data.beneficiary?.family_code || '-',
                            item.assistance?.assistanceType?.name || '-',
                            item.assistance?.name || '-',
                            item.quantity,
                            item.assistance?.assistanceType?.unit || '-',
                            new Date(data.delivery_date).toLocaleDateString('en-US'),
                            data.createdBy?.user?.name || '-',
                            data.review_status,
                            data.reviewed_at ? new Date(data.reviewed_at).toLocaleDateString('en-US') : '-',
                            data.notes || '-'
                        ]);
                    });
                } else {
                    // Delivery with no items
                    rows.push([
                        data.uid,
                        data.project?.name || '-',
                        data.beneficiary?.head_name || '-',
                        data.beneficiary?.family_code || '-',
                        '-',
                        '-',
                        0,
                        '-',
                        new Date(data.delivery_date).toLocaleDateString('en-US'),
                        data.createdBy?.user?.name || '-',
                        data.review_status,
                        data.reviewed_at ? new Date(data.reviewed_at).toLocaleDateString('en-US') : '-',
                        data.notes || '-'
                    ]);
                }
            });

            // Generate CSV
            const csv = generateCSV(headers, rows);

            // Log audit
            await logAudit({
                req,
                action: 'delivery.exported',
                entityType: 'delivery',
                metadata: {
                    period,
                    deliveries_count: deliveries.length,
                    items_count: rows.length
                }
            });

            // Set response headers
            const filename = `deliveries_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            res.status(200).send(csv);

        } catch (error) {
            console.error("Export Deliveries error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    }

}

export default ExportController;
