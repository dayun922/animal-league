import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schoolsRouter from "./schools";
import scoresRouter from "./scores";

const router: IRouter = Router();

router.use(healthRouter);
router.use(schoolsRouter);
router.use(scoresRouter);

export default router;
