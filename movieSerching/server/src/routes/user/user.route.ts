import { Router } from "express";
import * as userController from "@/controllers/user/user.controller";
import {
  authMiddleware,
  adminMiddleware,
} from "@/middlewares/system/authMiddleware";

const router = Router();

// User profile
router.put("/profile", authMiddleware, userController.updateProfile);

// Admin user management
router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers);
router.get("/:id", authMiddleware, adminMiddleware, userController.getUserById);
router.patch(
  "/:id/ban",
  authMiddleware,
  adminMiddleware,
  userController.banUser
);
router.patch(
  "/:id/unban",
  authMiddleware,
  adminMiddleware,
  userController.unbanUser
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  userController.deleteUser
);

export default router;
