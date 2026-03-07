import { Router } from "express";
import { ApiResponse } from "@/utils/apiResponse";
import authRoutes from "@/routes/auth/auth.route";
import movieRoutes from "@/routes/movie/movie.route";
import favoriteRoutes from "@/routes/favorite/favorite.route";
import watchHistoryRoutes from "@/routes/watchHistory/watchHistory.route";
import userRoutes from "@/routes/user/user.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tmdb/movies", movieRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/watch-history", watchHistoryRoutes);
router.use("/users", userRoutes);

// Health check
router.get("/health", (_req, res) => {
  ApiResponse.ok(res, { timestamp: new Date() }, "API is running");
});

export default router;
