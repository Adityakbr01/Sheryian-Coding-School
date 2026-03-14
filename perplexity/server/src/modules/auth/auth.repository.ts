
import prisma from "@/configs/db";
import { User } from "@prisma/client";

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: { email: string; password?: string; name?: string; avatar?: string }): Promise<User> {
    return prisma.user.create({ data });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
