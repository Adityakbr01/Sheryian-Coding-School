import { Router } from "express";
import * as watchHistoryController from "@/controllers/watchHistory/watchHistory.controller";
import { authMiddleware } from "@/middlewares/system/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", watchHistoryController.getUserWatchHistory);
router.post("/", watchHistoryController.addToWatchHistory);
router.delete("/clear", watchHistoryController.clearWatchHistory);

export default router;
