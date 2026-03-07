import { User, IUser } from "@/models/user/user.model";
import { AppError } from "@/utils/appError";
import { HTTP_STATUS } from "@/constants/httpStatus";

export const getAllUsers = async (
  page: number = 1,
  limit: number = 20
): Promise<{ users: IUser[]; total: number; totalPages: number }> => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);
  return { users, total, totalPages: Math.ceil(total / limit) };
};

export const getUserById = async (id: string): Promise<IUser> => {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  return user;
};

export const banUser = async (id: string): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: true },
    { new: true }
  );
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  return user;
};

export const unbanUser = async (id: string): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: false },
    { new: true }
  );
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  return user;
};

export const deleteUser = async (id: string): Promise<void> => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
};

export const updateUserProfile = async (
  id: string,
  data: { name?: string; avatar?: string }
): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  return user;
};
