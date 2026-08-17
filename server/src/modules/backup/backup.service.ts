import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Op } from "sequelize";
import os from "os";

import BackupRepository from "./backup.repository.js";

// ── Other module models (data collection) ──────────────────────
import OrganisationModel from "../organisation/organisation.model.js";
import SubscriptionModel from "../subscription/subscription.model.js";
import ProjectModel from "../project/project.model.js";
import MembershipModel from "../membership/membership.model.js";
import UserModel from "../user/user.model.js";
import BeneficiaryModel from "../beneficiary/beneficiary.model.js";
import DeliveryModel from "../delivery/delivery.model.js";
import AssistanceModel from "../assistance/assistance.model.js";
import MediaModel from "../media/media.model.js";
import BeneficiaryMemberModel from "../beneficiary-member/beneficiary-member.model.js";
import DeliveryItemModel from "../delivery-item/delivery-item.model.js";
import ProjectAssistanceModel from "../project-assistance/project-assistance.model.js";
import AssistanceTypeModel from "../assistance-type/assistance-type.model.js";
import ProjectMemberModel from "../project-member/project.member.model.js";
import type { BackupManifest, BulkBackupResult } from "./types/backup.types.js";
import BackupStorage from "./backup.storage.js";
import { createRequire } from "module";
import sequelize from "../../config/database.js";
import Media from "../media/media.model.js";
import MediaLink from "../media-link/media-link.model.js";
import SyncBatchModel from "../sync-batch/sync-batch.model.js";
import AuditLogModel from "../audit-log/audit-log.model.js";
import { OrganisationRepository } from "../auth/auth.repository.js";

const KORA_VERSION = "1.0.0";

const require = createRequire(import.meta.url);

// ── Helpers ──────────────────────────────────────────────────────

const computeChecksum = (filePath: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
    });

const slugify = (name: string): string =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const formatDateStamp = (): string =>
    new Date().toISOString().slice(0, 10).replace(/-/g, "");

const writeJson = (dir: string, name: string, data: any): void =>
    fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2), "utf-8");

const buildArchive = (sourceDir: string, outputPath: string): Promise<void> =>
    new Promise((resolve, reject) => {

        try {
            const { ZipArchive } = require("archiver");

            const output = fs.createWriteStream(outputPath);
            const archive = new ZipArchive({ zlib: { level: 9 } });

            archive.on("warning", (err: any) => {
                if (err.code === "ENOENT") {
                    console.warn("Archiver warning:", err);
                } else {
                    reject(err);
                }
            });

            archive.on("error", (err: any) => {
                console.error("Archiver error:", err);
                reject(err);
            });

            output.on("close", () => {
                console.log(`✅ Archive created: ${archive.pointer()} bytes`);
                resolve();
            });

            output.on("error", (err: any) => {
                console.error("Output stream error:", err);
                reject(err);
            });

            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();

        } catch (err) {
            console.error("buildArchive caught:", err);
            reject(err);
        }
    });

// ── Service ──────────────────────────────────────────────────────

const BackupService = {

    // Validate prerequisites before creating backup
    validatePrerequisites: async (organisationId: number): Promise<{
        valid: boolean;
        code?: string;
        org?: any;
    }> => {
        // Organisation exists and is active
        const orgData = await OrganisationModel.findOne({
            where: { id: organisationId },
        });

        console.log("BACKUP -- CHECKING ORG");

        if (!orgData) return { valid: false, code: "organisation_not_found" };

        console.log("BACKUP -- CHECKING ORG ACTIVE");

        const org = orgData.get({ plain: true }) as any;
        if (org.status !== "true") return { valid: false, code: "organisation_inactive" };

        // Subscription active
        const subscription = await SubscriptionModel.findOne({
            where: {
                organization_id: organisationId,
                status: "true",
                ends_at: { [Op.gt]: new Date() },
            },
        });

        console.log("BACKUP -- CHECKING SUB ACTIVE");

        if (!subscription) return { valid: false, code: "subscription_inactive" };

        // Manually check ends_at after retrieval to avoid shadow issue
        const subData = subscription.get({ plain: true }) as any;
        console.log("BACKUP -- SUB DATA:", subData);

        if (subData.ends_at && new Date(subData.ends_at) < new Date()) {
            return { valid: false, code: "subscription_inactive" };
        }

        // No backup already running
        const running = await BackupRepository.findRunning(organisationId);
        if (running) return { valid: false, code: "backup_already_running" };

        return { valid: true, org };
    },

    // Collect all data related to the organisation
    collectData: async (organisationId: number, org: any): Promise<Record<string, any>> => {

        console.log("Let's GO ---> COLLECT DATA");

        // ── Projects ─────────────────────────────────────────────────
        const projects = await ProjectModel.findAll({
            where: { organisation_id: organisationId },
            raw: true,
        });
        const projectIds = projects.map((p: any) => p.id);
        console.log("BACKUP -- GET PROJECT:", projects.length);

        // ── Memberships + Users ───────────────────────────────────────
        const memberships = await MembershipModel.findAll({
            where: { organization_id: organisationId },
            include: [{
                model: UserModel,
                as: "user",
                attributes: ["id", "uid", "name", "email", "phone", "status", "password", "date_of", "update_of"],
            }],
            raw: true,
            nest: true,
        });
        console.log("BACKUP -- GET MEMBERSHIP:", memberships.length);

        // ── Subscription ──────────────────────────────────────────────
        const subscriptions = await SubscriptionModel.findAll({
            where: { organization_id: organisationId },
            raw: true,
        });
        console.log("BACKUP -- GET SUBSCRIPTION:", subscriptions.length);

        // ── Beneficiaries ─────────────────────────────────────────────
        const beneficiaries = projectIds.length > 0
            ? await BeneficiaryModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];
        const beneficiaryIds = (beneficiaries as any[]).map((b) => b.id);
        console.log("BACKUP -- GET BENEF:", beneficiaries.length);

        // ── Beneficiary Members ───────────────────────────────────────
        const beneficiaryMembers = beneficiaryIds.length > 0
            ? await BeneficiaryMemberModel.findAll({
                where: { beneficiary_id: { [Op.in]: beneficiaryIds } },
                raw: true,
            })
            : [];
        console.log("BACKUP -- GET BENEF MEMBERS:", beneficiaryMembers.length);

        // ── Deliveries ────────────────────────────────────────────────
        const deliveries = projectIds.length > 0
            ? await DeliveryModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];
        const deliveryIds = (deliveries as any[]).map((d) => d.id);
        console.log("BACKUP -- GET DEL:", deliveries.length);

        // ── Delivery Items ────────────────────────────────────────────
        const deliveryItems = deliveryIds.length > 0
            ? await DeliveryItemModel.findAll({
                where: { delivery_id: { [Op.in]: deliveryIds } },
                raw: true,
            })
            : [];
        console.log("BACKUP -- GET DEL ITEMS:", deliveryItems.length);

        // ── Assistances ───────────────────────────────────────────────
        const assistances = await AssistanceModel.findAll({
            where: { organization_id: organisationId },
            raw: true,
        });
        console.log("BACKUP -- GET ASS:", assistances.length);

        // ── Assistance Types ──────────────────────────────────────────
        const assistanceTypes = await AssistanceTypeModel.findAll({
            where: { organization_id: organisationId },
            raw: true,
        });
        console.log("BACKUP -- GET ASS TYPES:", assistanceTypes.length);

        // ── Project Assistances ───────────────────────────────────────
        const projectAssistances = projectIds.length > 0
            ? await ProjectAssistanceModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];
        console.log("BACKUP -- GET PROJECT ASS:", projectAssistances.length);

        // ── Project Members ───────────────────────────────────────────
        const projectMembers = projectIds.length > 0
            ? await ProjectMemberModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];
        console.log("BACKUP -- GET PROJECT MEMBERS:", projectMembers.length);

        // ── Media ─────────────────────────────────────────────────────
        const media = await Media.findAll({
            where: { organisation_id: organisationId },
            raw: true,
        });
        const mediaIds = (media as any[]).map((m) => m.id);
        console.log("BACKUP -- GET MEDIA:", media.length);

        // ── Media Links ───────────────────────────────────────────────
        const mediaLinks = mediaIds.length > 0
            ? await MediaLink.findAll({
                where: { media_id: { [Op.in]: mediaIds } },
                raw: true,
            })
            : [];
        console.log("BACKUP -- GET MEDIA LINKS:", mediaLinks.length);

        // ── Sync Batches ──────────────────────────────────────────────
        const syncBatches = projectIds.length > 0
            ? await SyncBatchModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];
        console.log("BACKUP -- GET SYNC BATCHES:", syncBatches.length);

        // ── Audit Logs ────────────────────────────────────────────────
        const auditLogs = await AuditLogModel.findAll({
            where: { organisation_id: organisationId },
            raw: true,
        });
        console.log("BACKUP -- GET AUDIT LOGS:", auditLogs.length);

        return {
            organisation: org,
            subscription: subscriptions,
            projects,
            project_assistances: projectAssistances,
            project_members: projectMembers,
            memberships,
            beneficiaries,
            beneficiary_members: beneficiaryMembers,
            deliveries,
            delivery_items: deliveryItems,
            assistances,
            assistance_types: assistanceTypes,
            media,
            media_links: mediaLinks,
            sync_batches: syncBatches,
            audit_logs: auditLogs,
        };
    },
    // Run backup for a single org
    runBackupForOrg: async (
        organisationId: number,
        createdBy: number,
        type: "manual" | "automatic"
    ): Promise<{ success: boolean; backupId?: number; error?: string }> => {

        let backupId: number | null = null;

        try {
            // Check org exists and is active
            const orgData = await OrganisationModel.findOne({
                where: { id: organisationId },
            });

            if (!orgData) return { success: false, error: "organisation_not_found" };

            const org = orgData.get({ plain: true }) as any;
            if (org.status !== "true") return { success: false, error: "organisation_inactive" };

            // Check no backup already running for this org
            const running = await BackupRepository.findRunning(organisationId);
            if (running) return { success: false, error: "backup_already_running" };

            // Create record as processing
            const backupRecord = await BackupRepository.create({
                organisation_id: organisationId,
                created_by: createdBy,
                type,
                action_status: "processing",
                version: 1,
                status: "true",
            });

            backupId = backupRecord.id;

            // Collect data
            const collectedData = await BackupService.collectData(organisationId, org);

            // Build .kora file
            const { filePath, fileName, fileSize, checksum } =
                await BackupService.buildKoraFile(backupId!, organisationId, org.name, collectedData);

            // Mark completed
            await BackupRepository.markCompleted(backupId!, {
                file_name: fileName,
                file_size: fileSize,
                storage_path: filePath,
                checksum,
                version: 1,
            });

            console.log(`✅ Backup completed for org ${organisationId}: ${fileName}`);

            return { success: true, backupId: backupId! };

        } catch (error: any) {
            console.error(`❌ Backup failed for org ${organisationId}:`, error.message);

            if (backupId) {
                await BackupRepository.markFailed(backupId).catch(() => {});
            }

            return { success: false, error: error.message };
        }
    },


    // Bulk backup — all organisations
    runBulkBackup: async (
        organisationIds: number[],
        createdBy: number,
        type: "manual" | "automatic"
    ): Promise<BulkBackupResult> => {
        const results: BulkBackupResult["results"] = [];
        let successful = 0;
        let failed = 0;

        for (const orgId of organisationIds) {
            // Get org name for result
            const orgData = await OrganisationModel.findOne({
                where: { id: orgId },
                attributes: ["id", "name"],
            });

            const orgName = (orgData?.get({ plain: true }) as any)?.name || `Org #${orgId}`;

            const result = await BackupService.runBackupForOrg(orgId, createdBy, type);

            if (result.success) {
                successful++;
                results.push({
                    organisation_id: orgId,
                    organisation_name: orgName,
                    status: "success",
                    backup_id: result.backupId!,
                });
            } else {
                failed++;
                results.push({
                    organisation_id: orgId,
                    organisation_name: orgName,
                    status: "failed",
                    error: result.error!,
                });
            }
        }

        return {
            total: organisationIds.length,
            successful,
            failed,
            results,
        };
    },


    // Build .kora file from collected data
    buildKoraFile: async (
        backupId: number,
        organisationId: number,
        orgName: string,
        collectedData: Record<string, any>
    ): Promise<{ filePath: string; fileName: string; fileSize: number; checksum: string; storageKey: string }> => {
        const createdAt = new Date().toISOString();
        const orgSlug = slugify(orgName);
        const dateStamp = formatDateStamp();
        const fileName = `${orgSlug}-${dateStamp}-${backupId}.kora`;

        // Use OS temp dir instead of local storage folder
        const tempDir = path.join(os.tmpdir(), `kora_tmp_${backupId}_${Date.now()}`);
        const tempFilePath = path.join(os.tmpdir(), fileName);

        try {
            fs.mkdirSync(tempDir, { recursive: true });

            // ── Write JSON files ─────────────────────────────────────
            writeJson(tempDir, "organisation.json", collectedData.organisation);
            writeJson(tempDir, "projects.json", {
                projects: collectedData.projects,
                project_assistances: collectedData.project_assistances,
                project_members: collectedData.project_members,
            });
            writeJson(tempDir, "members.json", { memberships: collectedData.memberships });
            writeJson(tempDir, "beneficiaries.json", {
                beneficiaries: collectedData.beneficiaries,
                beneficiary_members: collectedData.beneficiary_members,
            });
            writeJson(tempDir, "deliveries.json", {
                deliveries: collectedData.deliveries,
                delivery_items: collectedData.delivery_items,
            });
            writeJson(tempDir, "assistances.json", {
                assistances: collectedData.assistances,
                assistance_types: collectedData.assistance_types,
            });
            writeJson(tempDir, "media.json", {
                media: collectedData.media,
                media_links: collectedData.media_links,
            });
            writeJson(tempDir, "sync.json", {
                sync_batches: collectedData.sync_batches,
            });
            writeJson(tempDir, "audit.json", {
                audit_logs: collectedData.audit_logs,
            });
            writeJson(tempDir, "subscription.json", {
                subscriptions: collectedData.subscription,
            });

            const manifest: BackupManifest = {
                version: 1,
                kora_version: KORA_VERSION,
                created_at: createdAt,
                organisation_id: organisationId,
                organisation_name: orgName,
                backup_id: backupId,
                summary: {
                    projects: collectedData.projects.length,
                    members: collectedData.memberships.length,
                    beneficiaries: collectedData.beneficiaries.length,
                    deliveries: collectedData.deliveries.length,
                    assistances: collectedData.assistances.length,
                    media: collectedData.media.length,
                    sync_batches: collectedData.sync_batches.length,
                    audit_logs: collectedData.audit_logs.length,
                    subscriptions: collectedData.subscription.length,
                },
                checksum: "pending",
            };

            writeJson(tempDir, "manifest.json", manifest);


            // ── 🔍 DEBUG MODE — inspect JSON files before archiving ──
            // console.log("\n📂 JSON files written to:", tempDir);
            // console.log("📋 Manifest summary:", JSON.stringify(manifest.summary, null, 2));

            // // List all files and their sizes
            // const files = fs.readdirSync(tempDir);
            // console.log("\n📁 Files in temp dir:");
            // for (const file of files) {
            //     const size = fs.statSync(path.join(tempDir, file)).size;
            //     console.log(`   ${file} — ${(size / 1024).toFixed(2)} KB`);
            // }

            // // Copy temp dir to a readable location for inspection
            // const inspectDir = path.join(process.cwd(), `debug_backup_${backupId}`);
            // if (fs.existsSync(inspectDir)) fs.rmSync(inspectDir, { recursive: true, force: true });
            // fs.cpSync(tempDir, inspectDir, { recursive: true });
            // console.log(`\n✅ JSON files copied to: ${inspectDir}`);
            // console.log("👆 Open that folder to inspect all JSON files\n");

            // // ── Fake return for debug mode ────────────────────────────
            // return {
            //     filePath: inspectDir,
            //     fileName,
            //     fileSize: 0,
            //     checksum: "debug_mode",
            //     storageKey: "debug_mode",
            // };

            // Build archive to temp path
            await buildArchive(tempDir, tempFilePath);

            await new Promise((r) => setTimeout(r, 200));

            if (!fs.existsSync(tempFilePath)) throw new Error("Archive file not created");

            const fileSize = fs.statSync(tempFilePath).size;
            if (fileSize === 0) throw new Error("Archive file is 0 bytes");

            // // Compute checksum
            const checksum = await BackupStorage.computeChecksum(tempFilePath);

            // // Upload to B2
            console.log(`📤 Uploading ${fileName} to B2...`);
            const { key } = await BackupStorage.upload(tempFilePath, fileName, organisationId);
            console.log(`✅ Uploaded to B2: ${key}`);

            return {
                filePath: key,      // ← store B2 key instead of local path
                fileName,
                fileSize,
                checksum,
                storageKey: key,
            };

        } finally {
            // Cleanup temp files
            await new Promise((r) => setTimeout(r, 100));
            if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            console.log("🧹 Temp files cleaned");
        }
    },

    // Update deleteFile — now deletes from B2
    deleteFile: async (storageKey: string): Promise<void> => {
        await BackupStorage.delete(storageKey);
    },

    // Verify checksum before download
    verifyChecksum: async (filePath: string, expectedChecksum: string): Promise<boolean> => {
        const current = await computeChecksum(filePath);
        return current === expectedChecksum;
    },


    restoreFromBackup: async (
        // backupId: number,
        uploadedFilePath: string,
        organisationId: number
    ): Promise<{ success: boolean; error?: string }> => {
        // const tempDir = path.join(os.tmpdir(), `kora_restore_${backupId}_${Date.now()}`);
        // const tempFilePath = path.join(os.tmpdir(), `restore_${backupId}.kora`);
        const tempDir = path.join(os.tmpdir(), `kora_restore_${crypto.randomUUID()}`);

        try {
            // 1. Find backup record
            // const backup = await BackupRepository.findCompletedById(backupId);
            // if (!backup) return { success: false, error: "backup_not_found" };

            // const backupData = backup.get({ plain: true }) as any;

            // // Ensure backup belongs to this org
            // if (backupData.organisation_id !== organisationId) {
            //     return { success: false, error: "backup_not_found" };
            // }

            // // 2. Verify checksum
            // console.log("🔐 Verifying backup integrity...");
            // const isValid = await BackupService.verifyChecksum(
            //     backupData.storage_path,
            //     backupData.checksum
            // );
            // if (!isValid) return { success: false, error: "backup_corrupted" };

            // // 3. Download .kora from B2 to temp file
            // console.log("📥 Downloading .kora from B2...");
            // const stream = await BackupStorage.download(backupData.storage_path);
            // await new Promise<void>((resolve, reject) => {
            //     const writeStream = fs.createWriteStream(tempFilePath);
            //     stream.pipe(writeStream);
            //     writeStream.on("finish", resolve);
            //     writeStream.on("error", reject);
            // });

            // 4. Extract ZIP (the .kora is a ZIP)
            console.log("📦 Extracting .kora archive from:", uploadedFilePath);
            fs.mkdirSync(tempDir, { recursive: true });

            const { createRequire } = await import("module");
            const req = createRequire(import.meta.url);
            const AdmZip = req("adm-zip");
            // const zip = new AdmZip(tempFilePath);
            const zip = new AdmZip(uploadedFilePath);
            zip.extractAllTo(tempDir, true);

            // 5. Read JSON files
            const readJson = (name: string) => {
                const filePath = path.join(tempDir, name);
                if (!fs.existsSync(filePath)) return null;
                return JSON.parse(fs.readFileSync(filePath, "utf-8"));
            };

            const manifest     = readJson("manifest.json");
            const orgData      = readJson("organisation.json");
            const projectsData = readJson("projects.json");
            const membersData  = readJson("members.json");
            const benefData    = readJson("beneficiaries.json");
            const delivData    = readJson("deliveries.json");
            const assData      = readJson("assistances.json");
            const mediaData     = readJson("media.json");
            const syncData      = readJson("sync.json"); 
            const auditData     = readJson("audit.json"); 
            const subData       = readJson("subscription.json");

            console.log("OR DATA --> ", orgData);

            if (!manifest || !orgData) {
                return { success: false, error: "invalid_backup_file" };
            }

            console.log(`📋 Restoring: ${manifest.organisation_name} (v${manifest.version})`);

            // 6. Restore inside a transaction
            await sequelize.transaction(async (t: any) => {

            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction: t });

            try {
                // ── Clear existing data ──────────────────────────────────
                const projectIds = await ProjectModel.findAll({
                    where: { organisation_id: organisationId },
                    attributes: ["id"],
                    transaction: t,
                    raw: true,
                }).then((rows: any[]) => rows.map((r: any) => r.id));

                if (projectIds.length > 0) {
                    const benefIds = await BeneficiaryModel.findAll({
                        where: { project_id: { [Op.in]: projectIds } },
                        attributes: ["id"],
                        transaction: t,
                        raw: true,
                    }).then((rows: any[]) => rows.map((r: any) => r.id));

                    const delivIds = await DeliveryModel.findAll({
                        where: { project_id: { [Op.in]: projectIds } },
                        attributes: ["id"],
                        transaction: t,
                        raw: true,
                    }).then((rows: any[]) => rows.map((r: any) => r.id));

                    if (delivIds.length > 0) await DeliveryItemModel.destroy({ where: { delivery_id: { [Op.in]: delivIds } }, transaction: t });
                    if (benefIds.length > 0) await BeneficiaryMemberModel.destroy({ where: { beneficiary_id: { [Op.in]: benefIds } }, transaction: t });
                    await DeliveryModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction: t });
                    await BeneficiaryModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction: t });
                    await ProjectAssistanceModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction: t });
                    await ProjectMemberModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction: t });
                    await SyncBatchModel.destroy({ where: { project_id: { [Op.in]: projectIds } }, transaction: t });
                }

                // Get media ids for media links cleanup
                const mediaIds = await Media.findAll({
                    where: { organisation_id: organisationId },
                    attributes: ["id"],
                    transaction: t,
                    raw: true,
                }).then((rows: any[]) => rows.map((r: any) => r.id));

                if (mediaIds.length > 0) {
                    await MediaLink.destroy({ where: { media_id: { [Op.in]: mediaIds } }, transaction: t });
                }

                await ProjectModel.destroy({ where: { organisation_id: organisationId }, transaction: t });
                await AssistanceModel.destroy({ where: { organization_id: organisationId }, transaction: t });
                await AssistanceTypeModel.destroy({ where: { organization_id: organisationId }, transaction: t });
                await MembershipModel.destroy({ where: { organization_id: organisationId }, transaction: t });
                await Media.destroy({ where: { organisation_id: organisationId }, transaction: t });
                await AuditLogModel.destroy({ where: { organisation_id: organisationId }, transaction: t });
                await SubscriptionModel.destroy({ where: { organization_id: organisationId }, transaction: t });
                await OrganisationModel.destroy({ where: { id: organisationId }, transaction: t })

                console.log("✅ Existing data cleared");

                // ── Helper for raw SQL insert ────────────────────────────
                const insertIgnore = async (table: string, rows: any[]) => {
                    if (!rows?.length) return;
                    for (const row of rows) {
                        const cols = Object.keys(row).join(", ");
                        const vals = Object.values(row).map((v: any) =>
                            v === null || v === undefined
                                ? "NULL"
                                : `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`
                        ).join(", ");
                        await sequelize.query(
                            `INSERT IGNORE INTO ${table} (${cols}) VALUES (${vals})`,
                            { transaction: t }
                        );
                    }
                    console.log(`✅ ${table} restored: ${rows.length}`);
                };

                // ── Restore in order ─────────────────────────────────────
                await insertIgnore("assistance_type", assData?.assistance_types);
                await insertIgnore("assistance", assData?.assistances);

                // Users first (memberships depend on them)
                if (membersData?.memberships?.length > 0) {
                    for (const m of membersData.memberships) {
                        if (m.user) {
                            await sequelize.query(
                                `INSERT IGNORE INTO users (id, uid, name, email, phone, password, status, date_of, update_of)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                {
                                    replacements: [
                                        m.user.id, m.user.uid, m.user.name, m.user.email,
                                        m.user.phone || null,
                                        m.user.password || "temp_password",
                                        m.user.status || "true",
                                        m.user.date_of || new Date(),
                                        m.user.update_of || new Date(),
                                    ],
                                    transaction: t,
                                }
                            );
                        }
                    }

                    const cleanMemberships = membersData.memberships.map((m: any) => ({
                        id: m.id,
                        user_id: m.user_id,
                        organization_id: m.organization_id,
                        role: m.role,
                        status: m.status,
                        date_of: m.date_of,
                    }));
                    await insertIgnore("membership", cleanMemberships);
                }

                // Subscription
                await insertIgnore("subscription", subData?.subscriptions);

                // Projects + relations
                await insertIgnore("projects", projectsData?.projects);
                await insertIgnore("project_assistance", projectsData?.project_assistances);
                await insertIgnore("project_members", projectsData?.project_members);

                // Beneficiaries
                await insertIgnore("beneficiaries", benefData?.beneficiaries);
                await insertIgnore("beneficiary_members", benefData?.beneficiary_members);

                // Deliveries
                await insertIgnore("deliveries", delivData?.deliveries);
                await insertIgnore("delivery_items", delivData?.delivery_items);

                // Media
                await insertIgnore("media", mediaData?.media);
                await insertIgnore("media_links", mediaData?.media_links);

                // Sync batches
                await insertIgnore("sync_batches", syncData?.sync_batches);

                // Audit logs
                await insertIgnore("audit_logs", auditData?.audit_logs);

                // Organisation
                await OrganisationRepository.create(orgData, t);

            } finally {
                await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction: t });
            }
        });


            console.log(`✅ Restore completed for org ${organisationId}`);
            return { success: true };

        } catch (error: any) {
            console.error("❌ Restore failed:", error.message);
            return { success: false, error: error.message || "restore_failed" };

        } finally {
            // Cleanup temp files
            // if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
            console.log("🧹 Temp files cleaned");
        }
    },

};

export default BackupService;