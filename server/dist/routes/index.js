import { Router } from "express";
import authRouter from "./auth.routes.js";
import assistanceRouter from "./assistance.route.js";
import assistanceTypeRouter from "./assistance-type.route.js";
import membershipRouter from "./membership.route.js";
import projectRoute from './project.route.js';
import dashbaordRoute from './dashbaord.route.js';
const router = Router();
router.use("/auth", authRouter);
router.use("/assistance", assistanceRouter);
router.use("/assistance-type", assistanceTypeRouter);
router.use("/membership", membershipRouter);
router.use("/projects", projectRoute);
router.use("/dashboard", dashbaordRoute);
export default router;
//# sourceMappingURL=index.js.map