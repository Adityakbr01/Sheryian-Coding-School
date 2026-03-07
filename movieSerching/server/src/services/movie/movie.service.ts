import { Movie, IMovie } from "@/models/movie/movie.model";
import { AppError } from "@/utils/appError";
import { HTTP_STATUS } from "@/constants/httpStatus";

export const createMovie = async (data: Partial<IMovie>): Promise<IMovie> => {
  const movie = await Movie.create(data);
  return movie;
};

export const getAllMovies = async (
  page: number = 1,
  limit: number = 20,
  category?: string,
  genre?: string
): Promise<{ movies: IMovie[]; total: number; totalPages: number }> => {
  const query: Record<string, any> = {};
  if (category) query.category = category;
  if (genre) query.genre = { $in: [genre] };

  const skip = (page - 1) * limit;
  const [movies, total] = await Promise.all([
    Movie.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Movie.countDocuments(query),
  ]);

  return { movies, total, totalPages: Math.ceil(total / limit) };
};

export const getMovieById = async (id: string): Promise<IMovie> => {
  const movie = await Movie.findById(id);
  if (!movie) throw new AppError("Movie not found", HTTP_STATUS.NOT_FOUND);
  return movie;
};

export const updateMovie = async (
  id: string,
  data: Partial<IMovie>
): Promise<IMovie> => {
  const movie = await Movie.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!movie) throw new AppError("Movie not found", HTTP_STATUS.NOT_FOUND);
  return movie;
};

export const deleteMovie = async (id: string): Promise<void> => {
  const movie = await Movie.findByIdAndDelete(id);
  if (!movie) throw new AppError("Movie not found", HTTP_STATUS.NOT_FOUND);
};

export const searchCustomMovies = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{ movies: IMovie[]; total: number }> => {
  const regex = new RegExp(query, "i");
  const skip = (page - 1) * limit;

  const [movies, total] = await Promise.all([
    Movie.find({
      $or: [{ title: regex }, { description: regex }],
    })
      .skip(skip)
      .limit(limit),
    Movie.countDocuments({
      $or: [{ title: regex }, { description: regex }],
    }),
  ]);

  return { movies, total };
};
