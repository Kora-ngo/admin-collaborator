import { Router } from "express";
import authRouter from "./auth.routes.js";
import assistanceRouter from "./assistance.route.js";
import assistanceTypeRouter from "./assistance-type.route.js";
import membershipRouter from "./membership.route.js";
import projectRoute from './project.route.js';
import dashbaordRoute from './dashbaord.route.js';
import enumeratorRoute from './enumerator.route.js';
import beneficiaryRoute from './beneficiary.route.js'
import deliveryRoute from './delivery.route.js';
import autditLogRoute from './auth.routes.js';



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


// Mobile-based
router.use("/mobile", enumeratorRoute);

export default router;