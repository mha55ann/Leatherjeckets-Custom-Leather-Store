import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import customInquiriesRouter from "./custom-inquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(customInquiriesRouter);

export default router;
