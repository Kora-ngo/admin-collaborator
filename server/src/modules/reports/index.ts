import ReportModel from "./report.model.js";
import ProjectModel from "../project/project.model.js";
import OrganisationModel from "../organisation/organisation.model.js";
import MembershipModel from "../membership/membership.model.js";

ReportModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project',
});

ReportModel.belongsTo(OrganisationModel, {
    foreignKey: 'organization_id',
    as: 'organisation',
});

ReportModel.belongsTo(MembershipModel, {
    foreignKey: 'generated_by',
    as: 'generatedBy',
});

export default ReportModel;