import { Router } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import substitutionRouter from "./substitution";
import materialsRouter from "./materials";
import productionRouter from "./production";
import salesRouter from "./sales";
import hrRouter from "./hr";
import fleetRouter from "./fleet";
import procurementRouter from "./procurement";
import pricingRouter from "./pricing";
import authRouter from "./auth";
import activityLogRouter from "./activity-log";
import notificationsRouter from "./notifications";

const router = Router();

router.use(healthRouter);
router.use("/ai", aiRouter);
router.use("/substitution", substitutionRouter);
router.use(materialsRouter);
router.use(productionRouter);
router.use(salesRouter);
router.use(hrRouter);
router.use(fleetRouter);
router.use(procurementRouter);
router.use(pricingRouter);
router.use(authRouter);
router.use(activityLogRouter);
router.use(notificationsRouter);

export default router;
