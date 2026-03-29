import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { RegisterInput, LoginInput } from './auth.schema'
import { AppError } from '../../utils/AppError'
import { env } from '../../config/env'
import { AuthDao } from './auth.dao'

export const AuthService = {
  async register(data: RegisterInput) {
    const existingUser = await AuthDao.findUserByEmail(data.email)

    if (existingUser) {
      throw new AppError('User already exists', 409)
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await AuthDao.createUser(data, hashedPassword)

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '7d',
    })

    return { user, token }
  },

  async login(data: LoginInput) {
    const user = await AuthDao.findUserByEmail(data.email)

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401)
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '7d',
    })

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }

    return { user: userWithoutPassword, token }
  },

  async getMe(payload: { userId: string }) {
    return await AuthDao.findUserById(payload.userId)
  },
}


