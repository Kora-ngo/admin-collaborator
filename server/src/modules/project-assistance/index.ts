import ProjectAssistanceModel from "./project-assistance.model.js";
import ProjectModel from "../project/project.model.js";
import AssistanceModel from "../assistance/assistance.model.js";

// Associations for ProjectAssistanceModel — extracted from the former models/index.ts

ProjectAssistanceModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

// ProjectAssistance -> Assistance
ProjectAssistanceModel.belongsTo(AssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'assistance'
});

export default ProjectAssistanceModel;