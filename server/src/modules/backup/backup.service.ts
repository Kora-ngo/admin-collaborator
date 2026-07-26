import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createRequire } from "module"; 
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
const BACKUP_DIR = path.resolve("D:/KoraBackups");

const require = createRequire(import.meta.url);

// Ensure storage directory exists on startup
try {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
    }
    // Test write permissions
    fs.accessSync(BACKUP_DIR, fs.constants.W_OK);
    console.log(`✅ Backup directory ready: ${BACKUP_DIR}`);
} catch (err) {
    console.error(`❌ Backup directory error: ${BACKUP_DIR}`, err);
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

        const projects = await ProjectModel.findAll({
            where: { organisation_id: organisationId },
            raw: true,
        });

        console.log("BACKUP -- GET PROJECT");

        const projectIds = projects.map((p: any) => p.id);


        console.log("BACKUP -- GET MEMBERSHIP");

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

        console.log("BACKUP -- GET BENEF");

        const beneficiaryIds = (beneficiaries as any[]).map((b) => b.id);


        console.log("BACKUP -- GET BENEF - MEMBS");

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


        console.log("BACKUP -- GET DEL");

        const deliveryIds = (deliveries as any[]).map((d) => d.id);


        console.log("BACKUP -- GET DEL - ITEMS");

        const deliveryItems = deliveryIds.length > 0
            ? await DeliveryItemModel.findAll({
                where: { delivery_id: { [Op.in]: deliveryIds } },
                raw: true,
            })
            : [];

        console.log("BACKUP -- ASS");

        const assistances = await AssistanceModel.findAll({
            where: { organization_id: organisationId },
            raw: true,
        });


        console.log("BACKUP -- GET ASS -TYPE");

        const assistanceTypes = await AssistanceTypeModel.findAll({
            where: { organization_id: organisationId },
            raw: true,
        });


        console.log("BACKUP -- GET PROJECT - ASS");

        const projectAssistances = projectIds.length > 0
            ? await ProjectAssistanceModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];

        console.log("BACKUP -- GET PROJECT - MEMBS");

        const projectMembers = projectIds.length > 0
            ? await ProjectMemberModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                raw: true,
            })
            : [];

        console.log("BACKUP -- GET MEDIA");
    
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
        console.log("📁 Creating temp dir:", tempDir);
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

        // Write manifest WITHOUT checksum (placeholder)
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
            checksum: "pending",
        };

        writeJson(tempDir, "manifest.json", manifest);

        console.log("📦 Building archive (single pass)...");

        // ── SINGLE archive pass ──────────────────────────────────
        await buildArchive(tempDir, outputPath);

        console.log("✅ Archive built");

        // Wait briefly for Windows file handle to release
        await new Promise((r) => setTimeout(r, 200));

        // Verify the file exists and has size
        if (!fs.existsSync(outputPath)) {
            throw new Error("Archive file not created");
        }

        const fileSize = fs.statSync(outputPath).size;
        if (fileSize === 0) {
            throw new Error("Archive file is 0 bytes");
        }

        console.log(`📦 Archive size: ${fileSize} bytes`);

        // Compute checksum of the final .kora file
        const finalChecksum = await computeChecksum(outputPath);
        console.log("🔐 Checksum:", finalChecksum);

        return { filePath: outputPath, fileName, fileSize, checksum: finalChecksum };

    } finally {
        // Cleanup temp dir
        await new Promise((r) => setTimeout(r, 100)); // small delay for Windows
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log("🧹 Temp dir cleaned");
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