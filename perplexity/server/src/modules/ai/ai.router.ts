import { Router } from "express";
import { AiController } from "@/modules/ai/ai.controller";
import { isAuth } from "@/middlewares/auth.middleware";

const router = Router();
const aiController = new AiController();

// Create a new completion prompt
router.post("/chat", isAuth, aiController.chat);

// Get query history for the authenticated user
router.get("/history", isAuth, aiController.getHistory);

export default router;
