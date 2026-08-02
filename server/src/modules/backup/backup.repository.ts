import BackupModel from "./backup.model.js";
import type { BackupRecord } from "./types/backup.types.js";

const BackupRepository = {

    create: async (data: Omit<BackupRecord, "id" | "created_at">): Promise<BackupModel> => {
        return BackupModel.create(data as any);
    },

    findById: async (id: number): Promise<BackupModel | null> => {
        return BackupModel.findOne({
            where: { id, status: "true" },
        });
    },

    findByIdAndOrg: async (id: number, organisationId: number): Promise<BackupModel | null> => {
        return BackupModel.findOne({
            where: { id, organisation_id: organisationId, status: "true" },
        });
    },

    findRunning: async (organisationId: number): Promise<BackupModel | null> => {
        return BackupModel.findOne({
            where: {
                organisation_id: organisationId,
                action_status: "processing",
            },
        });
    },

    findAnyRunning: async (): Promise<BackupModel | null> => {
        return BackupModel.findOne({
            where: { action_status: "processing" },
        });
    },

    findAllByOrg: async (
        organisationId: number,
        page: number,
        limit: number
    ): Promise<{ count: number; rows: BackupModel[] }> => {
        const offset = (page - 1) * limit;
        return BackupModel.findAndCountAll({
            where: { organisation_id: organisationId, status: "true" },
            order: [["created_at", "DESC"]],
            limit,
            offset,
        });
    },

    // Latest backup per org — for overview
    findLatestPerOrg: async (organisationIds: number[]): Promise<BackupModel[]> => {
        if (organisationIds.length === 0) return [];

        // Get latest completed backup for each org
        const results: BackupModel[] = [];

        for (const orgId of organisationIds) {
            const latest = await BackupModel.findOne({
                where: {
                    organisation_id: orgId,
                    status: "true",
                },
                order: [["created_at", "DESC"]],
            });
            if (latest) results.push(latest);
        }

        return results;
    },

    // Count stats per org
    countByOrg: async (organisationId: number): Promise<{
        total: number;
        failed: number;
        completed: number;
    }> => {
        const total = await BackupModel.count({
            where: { organisation_id: organisationId, status: "true" },
        });
        const failed = await BackupModel.count({
            where: { organisation_id: organisationId, status: "true", action_status: "failed" },
        });
        const completed = await BackupModel.count({
            where: { organisation_id: organisationId, status: "true", action_status: "completed" },
        });
        return { total, failed, completed };
    },

    markCompleted: async (
        id: number,
        data: {
            file_name: string;
            file_size: number;
            storage_path: string;
            checksum: string;
            version: number;
        }
    ): Promise<void> => {
        await BackupModel.update(
            { action_status: "completed", ...data },
            { where: { id } }
        );
    },

    markFailed: async (id: number): Promise<void> => {
        await BackupModel.update(
            { action_status: "failed" },
            { where: { id } }
        );
    },

    softDelete: async (id: number): Promise<void> => {
        await BackupModel.update(
            { status: "false" },
            { where: { id } }
        );
    },


    findCompletedById: async (id: number): Promise<BackupModel | null> => {
        return BackupModel.findOne({
            where: {
                id,
                status: "true",
                action_status: "completed",
            },
        });
    },
};

export default BackupRepository;