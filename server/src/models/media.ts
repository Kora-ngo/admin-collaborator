import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import type { MediaAttributes, MediaCreationAttributes } from "../types/media.js";

class Media extends Model<MediaAttributes, MediaCreationAttributes>
    implements MediaAttributes {
    public id!: number;
    public organisation_id!: number;
    public file_name!: string;
    public file_type!: 'image' | 'document';
    public size!: number;
    public storage_path!: string;
    public uploaded_by_membership_id!: number;
    public created_at!: Date;
    public updated_at!: Date;
}

Media.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file_type: {
        type: DataTypes.ENUM('image', 'document'),
        allowNull: false,
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    storage_path: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uploaded_by_membership_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'Media',
    tableName: 'media',
    timestamps: false,
});

export default Media;