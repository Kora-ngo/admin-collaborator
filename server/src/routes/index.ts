import { Router } from "express";
import authRouter from "../modules/auth/auth.routes.js";
import assistanceRouter from "../modules/assistance/assistance.route.js";
import assistanceTypeRouter from "../modules/assistance-type/assistance-type.route.js";
import membershipRouter from "../modules/membership/membership.route.js";
import dashbaordRoute from '../modules/dashboard/dashbaord.route.js';
import enumeratorRoute from '../modules/enumerators/enumerator.route.js';
import beneficiaryRoute from '../modules/beneficiary/beneficiary.route.js'
import deliveryRoute from '../modules/delivery/delivery.route.js';
import autditLogRoute from '../modules/audit-log/audit-log.route.js';
import exportRoute from "../modules/export/export.route.js";
import subscriptionRoute from '../modules/subscription/subscription.routes.js';
import healthRoute from '../modules/health/health.route.js';
import feedbackRoute from '../modules/feedback/feedback.routes.js';
import projectRoute from "../modules/project/project.route.js";
import analyticsRoute from "../modules/analytics/analytics.route.js";
import reportsRoute from "../modules/reports/report.route.js";


// Super -admin
import superAdminRouter from '../modules/super-admin/superAdmin.route.js';
import adminOrganisationRouter from '../modules/organisation/admin/organisation.route.js';
import adminMembershipRouter  from '../modules/membership/admin/membership.route.js';
import adminProjectRouter from '../modules/project/project.route.js';
import auditLogRouter  from '../modules/audit-log/admin/audit-log.route.js';
import subscriptionRouter from '../modules/subscription/admin/subscription.route.js';
import backupRouter  from "../modules/backup/backup.route.js";
import dateOperationRouted  from "../modules/data-operations/data-opertion.route.js";





const router = Router();

// Web-based
router.use("/auth", authRouter);
router.use("/assistance", assistanceRouter);
router.use("/assistance-type", assistanceTypeRouter);
router.use("/membership", membershipRouter);
router.use("/projects", projectRoute);
router.use("/dashboard", dashbaordRoute);
router.use("/beneficiaries", beneficiaryRoute);
router.use("/deliveries", deliveryRoute);
router.use("/audit-logs", autditLogRoute);
router.use("/export", exportRoute);
router.use("/subscription", subscriptionRoute);
router.use("/feedback", feedbackRoute);
router.use("/analytics", analyticsRoute);
router.use("/reports", reportsRoute);




// Mobile-based
router.use("/mobile", enumeratorRoute);

// Stay awake
router.use("/health", healthRoute);

// Super admin
router.use("/super-admin", superAdminRouter);
router.use('/super-admin/organisations', adminOrganisationRouter);
router.use('/super-admin/memberships', adminMembershipRouter);
router.use('/super-admin/projects', adminProjectRouter);
router.use('/super-admin/audit-logs', auditLogRouter);
router.use('/super-admin/subscriptions', subscriptionRouter);
router.use("/backup", backupRouter);
router.use("/data-operation", dateOperationRouted);






export default router;