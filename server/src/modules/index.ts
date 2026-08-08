// Imports every module's associations file purely for its side effects,
// so all Sequelize associations are registered before the app starts.
// This is the new single import point — replace whatever import in
// app.ts/server.ts used to point at the old models/index.ts with this file.

import AssistanceModel from "./assistance/index.js";
import AssistanceTypeModel from "./assistance-type/index.js";
import AuditLogModel from "./audit-log/index.js";
import BeneficiaryModel from "./beneficiary/index.js";
import BeneficiaryMemberModel from  "./beneficiary-member/index.js";
import DeliveryModel from "./delivery/index.js";
import DeliveryItemModel from "./delivery-item/index.js";
import Media from "./media/index.js";
import MediaLink from "./media-link/index.js";
import MembershipModel from "./membership/index.js";
import OrganisationModel from "./organisation/index.js";
import ProjectModel from "./project/index.js";
import ProjectAssistanceModel from "./project-assistance/index.js";
import ProjectMemberModel from "./project-member/index.js";
import SubscriptionModel from "./subscription/index.js";
import SyncBatchModel from "./sync-batch/index.js";
import UserModel from "./user/index.js";
import BackupModel from "./backup/backup.model.js";
import DataOperationModel from "./data-operations/data-operations.model.js";
// super-admin has no associations defined in the original file — nothing to extract


export {
    AssistanceModel,
    AssistanceTypeModel,
    
    MembershipModel,
    UserModel,
    OrganisationModel,


    ProjectModel,
    ProjectMemberModel,
    ProjectAssistanceModel,


    Media,
    MediaLink,

    BeneficiaryModel,
    BeneficiaryMemberModel,
    DeliveryModel,
    DeliveryItemModel,
    SyncBatchModel,
    SubscriptionModel,

    AuditLogModel,
    BackupModel,
    DataOperationModel

};