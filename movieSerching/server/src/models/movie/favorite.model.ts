import mongoose, { Schema, Document } from "mongoose";
import { MEDIA_TYPE, MEDIA_TYPE_VALUES, type MediaType } from "@/constants/mediaType";

export interface IFavorite extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tmdbId?: number;
  movieId?: mongoose.Types.ObjectId;
  title: string;
  posterUrl: string;
  mediaType: MediaType;
  rating?: number;
  releaseDate?: string;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
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
    rating: {
      type: Number,
      default: 0,
    },
    releaseDate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index({ userId: 1 });
favoriteSchema.index({ userId: 1, tmdbId: 1 }, { unique: true, sparse: true });

export const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
