import { Router } from "express";
import authRoutes from "@/modules/auth/auth.router";
import aiRoutes from "@/modules/ai/ai.router";

const router = Router();

router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);

export default router;