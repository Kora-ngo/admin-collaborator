import { Router } from "express";
import authRouter from "./auth.routes.js";
import assistanceRouter from "./assistance.route.js";
import assistanceTypeRouter from "./assistance-type.route.js";
import membershipRouter from "./membership.route.js";


const router = Router();

router.use("/auth", authRouter);
router.use("/assistance", assistanceRouter);
router.use("/assistance-type", assistanceTypeRouter);
router.use("/membership", membershipRouter);

export default router;