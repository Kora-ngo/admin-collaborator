import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";
import type { BackupActionStatus, BackupStatus, BackupType } from "./types/backup.types.js";


class BackupModel extends Model {
    declare id: number;
    declare organisation_id: number;
    declare created_by: number;
    declare type: BackupType;
    declare action_status: BackupActionStatus;
    declare file_name: string | null;
    declare file_size: number | null;
    declare storage_path: string | null;
    declare checksum: string | null;
    declare version: number;
    declare status: BackupStatus;
    declare created_at: Date;
}

BackupModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        organisation_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("manual", "automatic"),
            allowNull: false,
            defaultValue: "manual",
        },
        action_status: {
            type: DataTypes.ENUM("processing", "completed", "failed"),
            allowNull: false,
            defaultValue: "processing",
        },
        file_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        file_size: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        storage_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        checksum: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },
        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        status: {
            type: DataTypes.ENUM("true", "false"),
            allowNull: false,
            defaultValue: "true",
        },
    },
    {
        sequelize,
        tableName: "backups",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    }
);

export default BackupModel;