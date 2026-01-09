// src/models/MediaLink.ts

import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import type { MediaLinkAttributes, MediaLinkCreationAttributes } from "../types/media.js";

class MediaLink extends Model<MediaLinkAttributes, MediaLinkCreationAttributes>
    implements MediaLinkAttributes {
    public id!: number;
    public media_id!: number;
    public entity_type!: string;
    public entity_id!: number;
    public usage!: 'cover' | 'document';
    public created_at!: Date;
    public updated_at!: Date;
}

MediaLink.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    media_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    entity_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    usage: {
        type: DataTypes.ENUM('cover', 'document'),
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
    modelName: 'MediaLink',
    tableName: 'media_links',
    timestamps: false,
});

export default MediaLink;