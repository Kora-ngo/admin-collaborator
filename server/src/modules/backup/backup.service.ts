import path from "path";
import fs from "fs";
import crypto from "crypto";
import * as archiver from "archiver";
import { Op } from "sequelize";

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
import type { BackupManifest } from "./types/backup.types.js";

const KORA_VERSION = "1.0.0";
const BACKUP_DIR = path.resolve("storage/backups");

// Ensure storage directory exists on startup
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

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
        const archiver = require("archiver");
        const output = fs.createWriteStream(outputPath);
        const archive = archiver("zip", { zlib: { level: 9 } });
        output.on("close", resolve);
        archive.on("error", reject);
        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
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

        if (!orgData) return { valid: false, code: "organisation_not_found" };

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

        if (!subscription) return { valid: false, code: "subscription_inactive" };

        // No backup already running
        const running = await BackupRepository.findRunning(organisationId);
        if (running) return { valid: false, code: "backup_already_running" };

        return { valid: true, org };
    },

    // Collect all data related to the organisation
    collectData: async (organisationId: number, org: any): Promise<Record<string, any>> => {
        const projects = await ProjectModel.findAll({
            where: { organisation_id: organisationId },
            raw: true,
        });
        const projectIds = projects.map((p: any) => p.id);

        const memberships = await MembershipModel.findAll({
            where: { organization_id: organisationId },
            include: [{
                model: UserModel,
                as: "user",
                attributes: ["id", "uid", "name", "email", "phone", "status"],
            }],
            raw: true,
            nest: true,
        });

        const beneficiaries = projectIds.length > 0
            ? await BeneficiaryModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];

        const beneficiaryIds = (beneficiaries as any[]).map((b) => b.id);

        const beneficiaryMembers = beneficiaryIds.length > 0
            ? await BeneficiaryMemberModel.findAll({
                where: { beneficiary_id: { [Op.in]: beneficiaryIds } },
                raw: true,
            })
            : [];

        const deliveries = projectIds.length > 0
            ? await DeliveryModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];

        const deliveryIds = (deliveries as any[]).map((d) => d.id);

        const deliveryItems = deliveryIds.length > 0
            ? await DeliveryItemModel.findAll({
                where: { delivery_id: { [Op.in]: deliveryIds } },
                raw: true,
            })
            : [];

        const assistances = await AssistanceModel.findAll({
            where: { organization_id: organisationId },
            raw: true,
        });

        const assistanceTypes = await AssistanceTypeModel.findAll({
            where: { organization_id: organisationId },
            raw: true,
        });

        const projectAssistances = projectIds.length > 0
            ? await ProjectAssistanceModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];

        const projectMembers = projectIds.length > 0
            ? await ProjectMemberModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];

        const media = await MediaModel.findAll({
            where: { organisation_id: organisationId },
            raw: true,
        });

        return {
            organisation: org,
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
        };
    },

    // Build .kora file from collected data
    buildKoraFile: async (
        backupId: number,
        organisationId: number,
        orgName: string,
        collectedData: Record<string, any>
    ): Promise<{ filePath: string; fileName: string; fileSize: number; checksum: string }> => {
        const createdAt = new Date().toISOString();
        const orgSlug = slugify(orgName);
        const dateStamp = formatDateStamp();
        const fileName = `${orgSlug}-${dateStamp}-${backupId}.kora`;
        const outputPath = path.join(BACKUP_DIR, fileName);
        const tempDir = path.join(BACKUP_DIR, `tmp_${backupId}_${Date.now()}`);

        try {
            fs.mkdirSync(tempDir, { recursive: true });

            // Write each section
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
            writeJson(tempDir, "media.json", { media: collectedData.media });

            // Write manifest (without checksum first)
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
                },
                checksum: null,
            };

            writeJson(tempDir, "manifest.json", manifest);

            // First archive pass
            await buildArchive(tempDir, outputPath);

            // Compute checksum
            const checksum = await computeChecksum(outputPath);

            // Update manifest with checksum and rebuild
            manifest.checksum = checksum;
            writeJson(tempDir, "manifest.json", manifest);
            await buildArchive(tempDir, outputPath);

            // Final checksum after rebuild
            const finalChecksum = await computeChecksum(outputPath);
            const fileSize = fs.statSync(outputPath).size;

            return { filePath: outputPath, fileName, fileSize, checksum: finalChecksum };

        } finally {
            // Always cleanup temp dir
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        }
    },

    // Verify checksum before download
    verifyChecksum: async (filePath: string, expectedChecksum: string): Promise<boolean> => {
        const current = await computeChecksum(filePath);
        return current === expectedChecksum;
    },

    // Delete physical file
    deleteFile: (filePath: string): void => {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    },
};

export default BackupService;