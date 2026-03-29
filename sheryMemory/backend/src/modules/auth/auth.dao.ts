import prisma from '../../config/db'
import { RegisterInput } from './auth.schema'
import { logger } from '../../utils/logger'

export const AuthDao = {
  async findUserByEmail(email: string) {
    logger.info(`[AuthDao] 🔎 Finding user by email: ${email}...`)
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      logger.info(`[AuthDao] ✅ findUserByEmail: ${user ? 'Found' : 'Not Found'}`)
      return user
    } catch (error) {
      logger.error(`[AuthDao] ❌ findUserByEmail failed for ${email}`, error)
      throw error
    }
  },

  async createUser(data: RegisterInput, hashedPassword: string) {
    logger.info(`[AuthDao] 👤 Creating user: ${data.email}...`)
    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      })
      logger.info(`[AuthDao] ✅ User created successfully: ${user.id}`)
      return user
    } catch (error) {
      logger.error(`[AuthDao] ❌ createUser failed for ${data.email}`, error)
      throw error
    }
  },

  async findUserById(id: string) {
    logger.info(`[AuthDao] 🔎 Finding user by ID: ${id}...`)
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      })
      logger.info(`[AuthDao] ✅ findUserById: ${user ? 'Found' : 'Not Found'}`)
      return user
    } catch (error) {
      logger.error(`[AuthDao] ❌ findUserById failed for ${id}`, error)
      throw error
    }
  },
}

