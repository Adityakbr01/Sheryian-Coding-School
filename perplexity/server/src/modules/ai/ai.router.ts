import { Router } from "express";
import { aiController } from "@/modules/ai/ai.controller";
import { isAuth } from "@/middlewares/auth.middleware";

const router = Router();

// Create a new completion prompt
router.post("/chat", isAuth, aiController.chat);
// create chat
router.post("/chat/create", isAuth, aiController.chat); // Alias for /chat
// send message
router.post("/chat/:chatId", isAuth, aiController.chat); // Alias for /chat
//get chats
router.get("/chats", isAuth, aiController.getChats); // Get all chats for the authenticated user
//get messages
router.get("/chats/:chatId/messages", isAuth, aiController.getChatMessages); // Get messages for a specific chat
// Get query history for the authenticated user
router.get("/history", isAuth, aiController.getHistory);

export default router;
