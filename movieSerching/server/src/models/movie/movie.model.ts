import mongoose, { Schema, Document } from "mongoose";
import { CATEGORY_VALUES, MEDIA_TYPE, type Category } from "@/constants/mediaType";

export interface IMovie extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  description: string;
  tmdbId?: number;
  releaseDate: string;
  trailerUrl?: string;
  genre: string[];
  category: Category;
  rating?: number;
  voteCount?: number;
  popularity?: number;
  originalLanguage?: string;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    posterUrl: {
      type: String,
      default: "",
    },
    backdropUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "Description not available",
    },
    tmdbId: {
      type: Number,
      sparse: true,
    },
    releaseDate: {
      type: String,
      default: "",
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    genre: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: CATEGORY_VALUES,
      default: MEDIA_TYPE.MOVIE,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    originalLanguage: {
      type: String,
      default: "en",
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: "text", description: "text" });;
movieSchema.index({ category: 1 });
movieSchema.index({ genre: 1 });

export const Movie = mongoose.model<IMovie>("Movie", movieSchema);
