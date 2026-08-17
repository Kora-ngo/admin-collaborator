import SyncBatchModel from "./sync-batch.model.js";
import ProjectModel from "../project/project.model.js";
import MembershipModel from "../membership/membership.model.js";

// Associations for SyncBatchModel — extracted from the former models/index.ts

// ========================================
// SYNC BATCH RELATIONS
// ========================================

// SyncBatch -> Project
SyncBatchModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

// SyncBatch -> Submitter (Membership)
SyncBatchModel.belongsTo(MembershipModel, {
    foreignKey: 'submitted_by_membership_id',
    as: 'submittedBy'
});

// SyncBatch -> Reviewer (Membership)
SyncBatchModel.belongsTo(MembershipModel, {
    foreignKey: 'reviewed_by_membership_id',
    as:'reviewedBy'

});

export default SyncBatchModel;