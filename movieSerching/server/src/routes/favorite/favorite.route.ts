import { Router } from "express";
import * as favoriteController from "@/controllers/favorite/favorite.controller";
import { authMiddleware } from "@/middlewares/system/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", favoriteController.getUserFavorites);
router.post("/", favoriteController.addFavorite);
router.delete("/:id", favoriteController.removeFavorite);
router.delete("/tmdb/:tmdbId", favoriteController.removeFavoriteByTmdbId);
router.get("/check/:tmdbId", favoriteController.checkIsFavorite);

export default router;
