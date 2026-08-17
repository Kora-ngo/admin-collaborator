import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";
import type { ProjectRegionAttributes, ProjectRegionCreationAttributes } from "../project/types/project.js";

class ProjectRegion extends Model<ProjectRegionAttributes, ProjectRegionCreationAttributes>
    implements ProjectRegionAttributes {
    public id!: number;
    public project_id!: number;
    public code!: string;
    public region?: string;
}

const ProjectRegionModel = ProjectRegion.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    region: {
        type: DataTypes.STRING(255),
    },
}, {
    sequelize,
    modelName: 'ProjectRegion',
    tableName: 'project_regions',
    timestamps: false,
});

export default ProjectRegionModel;