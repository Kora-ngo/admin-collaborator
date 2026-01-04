
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import type { ProjectAssistanceAttributes, ProjectAssistanceCreationAttributes } from "../types/project.js";

class ProjectAssistance extends Model<ProjectAssistanceAttributes, ProjectAssistanceCreationAttributes>
    implements ProjectAssistanceAttributes {
    public id!: number;
    public project_id!: number;
    public assistance_id!: number;
}

const ProjectAssistanceModel = ProjectAssistance.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assistance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'ProjectAssistance',
    tableName: 'project_assistance',
    timestamps: false,
});

export default ProjectAssistanceModel;