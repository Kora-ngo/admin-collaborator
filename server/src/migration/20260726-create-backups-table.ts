import { QueryInterface, DataTypes } from "sequelize";

export const up = async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable("backups", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            organisation_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "organisation",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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
                type: DataTypes.STRING(255),
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
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        // Indexes
        await queryInterface.addIndex("backups", ["organisation_id"], {
            name: "backups_organisation_id_idx",
        });

        await queryInterface.addIndex("backups", ["created_by"], {
            name: "backups_created_by_idx",
        });

        await queryInterface.addIndex("backups", ["action_status"], {
            name: "backups_action_status_idx",
        });

        await queryInterface.addIndex("backups", ["status"], {
            name: "backups_status_idx",
        });
    };

export const down = async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.dropTable("backups");
    };