import { Router } from "express";
import authRouter from "./auth.routes.js";
import assistanceRouter from "./assistance.route.js";


const router = Router();

router.use("/auth", authRouter);
router.use("/assistance", assistanceRouter)

export default router;