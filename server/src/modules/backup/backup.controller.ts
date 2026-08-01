import type { Request, Response } from "express";
import fs from "fs";
import BackupRepository from "./backup.repository.js";
import BackupService from "./backup.service.js";
import OrganisationModel from "../organisation/organisation.model.js";

const BackupController = {

    // ── POST /api/backup
    // Single org backup (the org admin triggers their own)
    create: async (req: Request, res: Response) => {
        const organisationId = req.user?.organizationId!;
        const userId = req.superAdmin?.superAdminId!;

        try {
            // Validate prerequisites (subscription etc.)
            const { valid, code } = await BackupService.validatePrerequisites(organisationId);
            if (!valid) {
                const statusMap: Record<string, number> = {
                    organisation_not_found: 404,
                    organisation_inactive: 403,
                    subscription_inactive: 403,
                    backup_already_running: 409,
                };
                return res.status(statusMap[code!] || 400).json({
                    type: "error",
                    message: code,
                });
            }

            const result = await BackupService.runBackupForOrg(organisationId, userId, "manual");

            if (!result.success) {
                return res.status(500).json({ type: "error", message: result.error });
            }

            return res.status(201).json({
                type: "success",
                message: "backup_created",
                data: { backup_id: result.backupId },
            });

        } catch (error) {
            console.error("Backup create error:", error);
            return res.status(500).json({ type: "error", message: "backup_failed" });
        }
    },

    // ── POST /api/backup/single/:organisationId
    // Super admin backs up a specific org
    createForOrg: async (req: Request, res: Response) => {
        const organisationId = parseInt(req.params.organisationId!);
        const userId = req.superAdmin?.superAdminId!;

        try {
            if (!organisationId) {
                return res.status(400).json({ type: "error", message: "organisation_id_required" });
            }

            const result = await BackupService.runBackupForOrg(organisationId, userId, "manual");

            if (!result.success) {
                const statusMap: Record<string, number> = {
                    organisation_not_found: 404,
                    organisation_inactive: 403,
                    backup_already_running: 409,
                };
                return res.status(statusMap[result.error!] || 500).json({
                    type: "error",
                    message: result.error,
                });
            }

            return res.status(201).json({
                type: "success",
                message: "backup_created",
                data: { backup_id: result.backupId, organisation_id: organisationId },
            });

        } catch (error) {
            console.error("createForOrg error:", error);
            return res.status(500).json({ type: "error", message: "backup_failed" });
        }
    },

    // ── POST /api/backup/bulk
    // Super admin backs up all orgs or a selection
    // Body: { organisation_ids?: number[] } — if empty, backs up ALL active orgs
    createBulk: async (req: Request, res: Response) => {
        const userId = req.superAdmin?.superAdminId!;
        const { organisation_ids } = req.body;

        try {
            let targetIds: number[] = organisation_ids || [];

            // If no specific orgs provided — back up ALL active orgs
            if (targetIds.length === 0) {
                const allOrgs = await OrganisationModel.findAll({
                    where: { status: "true" },
                    attributes: ["id"],
                });
                targetIds = allOrgs.map((o: any) => o.get("id") as number);
            }

            if (targetIds.length === 0) {
                return res.status(404).json({ type: "error", message: "no_active_organisations" });
            }

            console.log(`🔵 Bulk backup started for ${targetIds.length} organisations`);

            const bulkResult = await BackupService.runBulkBackup(targetIds, userId, "manual");

            console.log(`✅ Bulk backup done — ${bulkResult.successful}/${bulkResult.total} succeeded`);

            return res.status(200).json({
                type: bulkResult.failed === 0 ? "success" : "warning",
                message: bulkResult.failed === 0 ? "bulk_backup_completed" : "bulk_backup_partial",
                data: bulkResult,
            });

        } catch (error) {
            console.error("createBulk error:", error);
            return res.status(500).json({ type: "error", message: "backup_failed" });
        }
    },

    // ── POST /api/backup/automatic
    // Called by a cron job or scheduled task
    // Body: { organisation_ids?: number[] } — if empty, backs up ALL active orgs
    createAutomatic: async (req: Request, res: Response) => {
        const userId = req.superAdmin?.superAdminId!;
        const { organisation_ids } = req.body;

        try {
            let targetIds: number[] = organisation_ids || [];

            if (targetIds.length === 0) {
                const allOrgs = await OrganisationModel.findAll({
                    where: { status: "true" },
                    attributes: ["id"],
                });
                targetIds = allOrgs.map((o: any) => o.get("id") as number);
            }

            if (targetIds.length === 0) {
                return res.status(404).json({ type: "error", message: "no_active_organisations" });
            }

            console.log(`🤖 Automatic backup started for ${targetIds.length} organisations`);

            const bulkResult = await BackupService.runBulkBackup(targetIds, userId, "automatic");

            return res.status(200).json({
                type: bulkResult.failed === 0 ? "success" : "warning",
                message: "automatic_backup_completed",
                data: bulkResult,
            });

        } catch (error) {
            console.error("createAutomatic error:", error);
            return res.status(500).json({ type: "error", message: "backup_failed" });
        }
    },

    // ── GET /api/backup
    // Org admin — their own backups
    fetchAll: async (req: Request, res: Response) => {
        try {
            const organisationId = req.user?.organizationId!;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { count, rows } = await BackupRepository.findAllByOrg(
                organisationId, page, limit
            );

            return res.status(200).json({
                type: "success",
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                    hasNext: page < Math.ceil(count / limit),
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error("fetchAll error:", error);
            return res.status(500).json({ type: "error", message: "server_error" });
        }
    },

    // ── GET /api/backup/org/:organisationId
    // Super admin — backups for a specific org
    fetchByOrg: async (req: Request, res: Response) => {
        try {
            const organisationId = parseInt(req.params.organisationId!);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!organisationId) {
                return res.status(400).json({ type: "error", message: "organisation_id_required" });
            }

            const { count, rows } = await BackupRepository.findAllByOrg(
                organisationId, page, limit
            );

            return res.status(200).json({
                type: "success",
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                    hasNext: page < Math.ceil(count / limit),
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error("fetchByOrg error:", error);
            return res.status(500).json({ type: "error", message: "server_error" });
        }
    },

    // ── GET /api/backup/overview
    // Super admin — latest backup + stats per org
    fetchOverview: async (req: Request, res: Response) => {
        try {
            const allOrgs = await OrganisationModel.findAll({
                where: { status: "true" },
                attributes: ["id", "name"],
                raw: true,
            });

            const overview = await Promise.all(
                allOrgs.map(async (org: any) => {
                    const stats = await BackupRepository.countByOrg(org.id);

                    const latest = await BackupModel.findOne({
                        where: { organisation_id: org.id, status: "true" },
                        order: [["created_at", "DESC"]],
                    });

                    const latestData = latest?.get({ plain: true }) as any;

                    return {
                        organisation_id: org.id,
                        organisation_name: org.name,
                        total_backups: stats.total,
                        failed_backups: stats.failed,
                        completed_backups: stats.completed,
                        storage_used: null, // computed later if needed
                        last_backup: latestData ? {
                            id: latestData.id,
                            type: latestData.type,
                            action_status: latestData.action_status,
                            file_size: latestData.file_size,
                            created_at: latestData.created_at,
                        } : null,
                    };
                })
            );

            return res.status(200).json({
                type: "success",
                data: overview,
            });

        } catch (error) {
            console.error("fetchOverview error:", error);
            return res.status(500).json({ type: "error", message: "server_error" });
        }
    },

    // ── GET /api/backup/:id/download
    download: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id!);
            const organisationId = req.user?.organizationId;

            const backup = organisationId
                ? await BackupRepository.findByIdAndOrg(id, organisationId)
                : await BackupRepository.findById(id);

            if (!backup) {
                return res.status(404).json({ type: "error", message: "backup_not_found" });
            }

            if (backup.action_status !== "completed") {
                return res.status(400).json({ type: "error", message: "backup_not_ready" });
            }

            if (!backup.storage_path) {
                return res.status(404).json({ type: "error", message: "backup_file_not_found" });
            }

            // Verify file exists on B2
            const exists = await BackupStorage.exists(backup.storage_path);
            if (!exists) {
                return res.status(404).json({ type: "error", message: "backup_file_not_found_on_storage" });
            }

            // Stream from B2 directly to client
            const stream = await BackupStorage.download(backup.storage_path);

            res.setHeader("Content-Disposition", `attachment; filename="${backup.file_name}"`);
            res.setHeader("Content-Type", "application/octet-stream");
            if (backup.file_size) {
                res.setHeader("Content-Length", backup.file_size.toString());
            }

            stream.pipe(res);

            stream.on("error", (err) => {
                console.error("Stream error:", err);
                if (!res.headersSent) {
                    res.status(500).json({ type: "error", message: "download_failed" });
                }
            });

        } catch (error) {
            console.error("download error:", error);
            return res.status(500).json({ type: "error", message: "server_error" });
        }
    },

    // ── DELETE /api/backup/:id
    delete: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id!);
            const organisationId = req.user?.organizationId;

            const backup = organisationId
                ? await BackupRepository.findByIdAndOrg(id, organisationId)
                : await BackupRepository.findById(id);

            if (!backup) {
                return res.status(404).json({ type: "error", message: "backup_not_found" });
            }

            // Delete from B2
            if (backup.storage_path) {
                await BackupStorage.delete(backup.storage_path).catch((err) => {
                    console.warn("B2 delete warning:", err.message);
                    // Don't fail the request if B2 delete fails
                });
            }

            // Soft delete record
            await BackupRepository.softDelete(id);

            return res.status(200).json({ type: "success", message: "backup_deleted" });

        } catch (error) {
            console.error("delete error:", error);
            return res.status(500).json({ type: "error", message: "server_error" });
        }
    },
};

// Add missing import
import BackupModel from "./backup.model.js";
import BackupStorage from "./backup.storage.js";

export default BackupController;