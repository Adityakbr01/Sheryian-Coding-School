import mongoose, { Schema, Document } from "mongoose";
import { MEDIA_TYPE, MEDIA_TYPE_VALUES, type MediaType } from "@/constants/mediaType";

export interface IWatchHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tmdbId?: number;
  movieId?: mongoose.Types.ObjectId;
  title: string;
  posterUrl: string;
  mediaType: MediaType;
  watchedAt: Date;
}

const watchHistorySchema = new Schema<IWatchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tmdbId: {
      type: Number,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
    },
    title: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: MEDIA_TYPE_VALUES,
      default: MEDIA_TYPE.MOVIE,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

watchHistorySchema.index({ userId: 1, watchedAt: -1 });
watchHistorySchema.index({ userId: 1, tmdbId: 1 });

export const WatchHistory = mongoose.model<IWatchHistory>(
  "WatchHistory",
  watchHistorySchema
);
