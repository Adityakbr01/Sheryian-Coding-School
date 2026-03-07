import jwt from "jsonwebtoken";
import { env } from "@/configs/env";
import { User, IUser } from "@/models/user/user.model";
import { AppError } from "@/utils/appError";
import { HTTP_STATUS } from "@/constants/httpStatus";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: IUser; token: string }> => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError("User with this email already exists", HTTP_STATUS.CONFLICT);
  }

  const user = await User.create(data);
  const token = generateToken(user);

  return { user, token };
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<{ user: IUser; token: string }> => {
  const user = await User.findOne({ email: data.email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.isBanned) {
    throw new AppError("Your account has been banned. Contact support.", HTTP_STATUS.FORBIDDEN);
  }

  const isPasswordMatch = await user.comparePassword(data.password);
  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  const token = generateToken(user);
  return { user, token };
};

export const getCurrentUser = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }
  return user;
};

const generateToken = (user: IUser): string => {
  return jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
};
