import { WatchHistory, IWatchHistory } from "@/models/movie/watchHistory.model";
import type { MediaType } from "@/constants/mediaType";

export const addToWatchHistory = async (
  userId: string,
  data: {
    tmdbId?: number;
    movieId?: string;
    title: string;
    posterUrl: string;
    mediaType: MediaType;
  }
): Promise<IWatchHistory> => {
  // Upsert: update if exists, create if not
  if (data.tmdbId) {
    const existing = await WatchHistory.findOneAndUpdate(
      { userId, tmdbId: data.tmdbId },
      { ...data, userId, watchedAt: new Date() },
      { new: true, upsert: true }
    );
    return existing;
  }

  const entry = await WatchHistory.create({
    userId,
    ...data,
    watchedAt: new Date(),
  });
  return entry;
};

export const getUserWatchHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  history: IWatchHistory[];
  total: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;
  const [history, total] = await Promise.all([
    WatchHistory.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ watchedAt: -1 }),
    WatchHistory.countDocuments({ userId }),
  ]);

  return { history, total, totalPages: Math.ceil(total / limit) };
};

export const clearWatchHistory = async (userId: string): Promise<void> => {
  await WatchHistory.deleteMany({ userId });
};
