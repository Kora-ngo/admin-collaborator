import { type Request, type Response } from 'express';
import fs from "fs";
import BackupRepository from "./backup.repository.js";
import BackupService from "./backup.service.js";

const BackupController = {

    // POST /api/backup
    create: async (req: Request, res: Response) => {
        const organisationId = req.user?.organizationId!;
        const userId = req.user?.userId!;

        let backupId: number | null = null;

        try {
            // 1. Validate prerequisites
            const { valid, code, org } = await BackupService.validatePrerequisites(organisationId);

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

            // 2. Create record as "processing"
            const backupRecord = await BackupRepository.create({
                organisation_id: organisationId,
                created_by: userId,
                type: "manual",
                action_status: "processing",
                version: 1,
                status: "true",
            });

            backupId = backupRecord.id;

            // 3. Collect all org data
            const collectedData = await BackupService.collectData(organisationId, org);

            // 4. Build .kora archive
            const { filePath, fileName, fileSize, checksum } =
                await BackupService.buildKoraFile(backupId!, organisationId, org.name, collectedData);

            // 5. Mark as completed
            await BackupRepository.markCompleted(backupId!, {
                file_name: fileName,
                file_size: fileSize,
                storage_path: filePath,
                checksum,
                version: 1,
            });

            console.log(`✅ Backup completed: ${fileName} (${fileSize} bytes)`);

            return res.status(201).json({
                type: "success",
                message: "backup_created",
                data: {
                    id: backupId,
                    file_name: fileName,
                    file_size: fileSize,
                    checksum,
                    version: 1,
                    created_at: new Date().toISOString(),
                },
            });

        } catch (error) {
            console.error("Backup create error:", error);

            // Mark as failed
            if (backupId) {
                await BackupRepository.markFailed(backupId).catch(() => {});
            }

            return res.status(500).json({ type: "error", message: "backup_failed" });
        }
    },

    // GET /api/backup
    fetchAll: async (req: Request, res: Response) => {
        try {
            const organisationId = req.user?.organizationId!;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { count, rows } = await BackupRepository.findAllByOrg(
                organisationId,
                page,
                limit
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
            console.error("Backup fetchAll error:", error);
            return res.status(500).json({ type: "error", message: "server_error" });
        }
    },

    // GET /api/backup/:id/download
    download: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id!);
            const organisationId = req.user?.organizationId!;

            const backup = await BackupRepository.findByIdAndOrg(id, organisationId);

            if (!backup) {
                return res.status(404).json({ type: "error", message: "backup_not_found" });
            }

            if (backup.action_status !== "completed") {
                return res.status(400).json({ type: "error", message: "backup_not_ready" });
            }

            if (!backup.storage_path || !require("fs").existsSync(backup.storage_path)) {
                return res.status(404).json({ type: "error", message: "backup_file_not_found" });
            }

            // Verify integrity before download
            const isValid = await BackupService.verifyChecksum(backup.storage_path, backup.checksum!);
            if (!isValid) {
                console.error(`Checksum mismatch for backup ${id}`);
                return res.status(500).json({ type: "error", message: "backup_corrupted" });
            }

            res.setHeader("Content-Disposition", `attachment; filename="${backup.file_name}"`);
            res.setHeader("Content-Type", "application/octet-stream");
            res.setHeader("Content-Length", backup.file_size!.toString());

            const stream = require("fs").createReadStream(backup.storage_path);
            stream.pipe(res);

        } catch (error) {
            console.error("Backup download error:", error);
            return res.status(500).json({ type: "error", message: "server_error" });
        }
    },

    // DELETE /api/backup/:id
    delete: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id!);
            const organisationId = req.user?.organizationId!;

            const backup = await BackupRepository.findByIdAndOrg(id, organisationId);

            if (!backup) {
                return res.status(404).json({ type: "error", message: "backup_not_found" });
            }

            // Delete physical file
            if (backup.storage_path) {
                BackupService.deleteFile(backup.storage_path);
            }

            // Soft delete record
            await BackupRepository.softDelete(id);

            return res.status(200).json({ type: "success", message: "backup_deleted" });

        } catch (error) {
            console.error("Backup delete error:", error);
            return res.status(500).json({ type: "error", message: "server_error" });
        }
    },
};

export default BackupController;