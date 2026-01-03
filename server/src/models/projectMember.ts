import { DataTypes, Model } from "sequelize";
import type { ProjectMemberAttributes, ProjectMemberCreationAttributes } from "../types/project.js";
import sequelize from "../config/database.js";

class ProjectMember extends Model<ProjectMemberAttributes, ProjectMemberCreationAttributes>
    implements ProjectMemberAttributes {
    public id!: number;
    public project_id!: number;
    public membership_id!: number;
    public role_in_project!: 'collaborator' | 'enumerator';
    public assigned_at!: Date;
}

const ProjectMemberModel = ProjectMember.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    membership_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role_in_project: {
        type: DataTypes.ENUM('collaborator', 'enumerator'),
        allowNull: false,
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'ProjectMember',
    tableName: 'project_members',
    timestamps: false,
});

export default ProjectMemberModel;