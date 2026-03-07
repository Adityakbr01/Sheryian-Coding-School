import { Favorite, IFavorite } from "@/models/movie/favorite.model";
import { AppError } from "@/utils/appError";
import { HTTP_STATUS } from "@/constants/httpStatus";
import type { MediaType } from "@/constants/mediaType";

export const addFavorite = async (
  userId: string,
  data: {
    tmdbId?: number;
    movieId?: string;
    title: string;
    posterUrl: string;
    mediaType: MediaType;
    rating?: number;
    releaseDate?: string;
  }
): Promise<IFavorite> => {
  // Check for duplicate
  if (data.tmdbId) {
    const existing = await Favorite.findOne({ userId, tmdbId: data.tmdbId });
    if (existing) throw new AppError("Already in favorites", HTTP_STATUS.CONFLICT);
  }

  const favorite = await Favorite.create({ userId, ...data });
  return favorite;
};

export const removeFavorite = async (
  userId: string,
  favoriteId: string
): Promise<void> => {
  const fav = await Favorite.findOneAndDelete({ _id: favoriteId, userId });
  if (!fav) throw new AppError("Favorite not found", HTTP_STATUS.NOT_FOUND);
};

export const removeFavoriteByTmdbId = async (
  userId: string,
  tmdbId: number
): Promise<void> => {
  const fav = await Favorite.findOneAndDelete({ userId, tmdbId });
  if (!fav) throw new AppError("Favorite not found", HTTP_STATUS.NOT_FOUND);
};

export const getUserFavorites = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ favorites: IFavorite[]; total: number; totalPages: number }> => {
  const skip = (page - 1) * limit;
  const [favorites, total] = await Promise.all([
    Favorite.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Favorite.countDocuments({ userId }),
  ]);

  return { favorites, total, totalPages: Math.ceil(total / limit) };
};

export const checkIsFavorite = async (
  userId: string,
  tmdbId: number
): Promise<boolean> => {
  const fav = await Favorite.findOne({ userId, tmdbId });
  return !!fav;
};
