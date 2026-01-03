import { DataTypes, Model } from "sequelize";
import type { ProjectAttributes, ProjectCreationAttributes } from "../types/project.js";
import sequelize from "../config/database.js";

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> 
    implements ProjectAttributes {
    public id!: number;
    public organisation_id!: number;
    public name!: string;
    public description?: string;
    public status!: 'true' | 'false' | 'pending' | 'ongoing' | 'done' | 'suspended';
    public start_date?: Date;
    public end_date?: Date;
    public target_families?: number;
    public created_at!: Date;
}

const ProjectModel = Project.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('true', 'false', 'pending', 'ongoing', 'done', 'suspended'),
        allowNull: false,
        defaultValue: 'pending',
    },
    start_date: {
        type: DataTypes.DATE,
    },
    end_date: {
        type: DataTypes.DATE,
    },
    target_families: {
        type: DataTypes.INTEGER,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: false,
});

export default ProjectModel;