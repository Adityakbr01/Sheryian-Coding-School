import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../../config/db'
import { RegisterInput, LoginInput } from './auth.schema'
import { AppError } from '../../utils/AppError'
import { env } from '../../config/env'

export class AuthService {
    static async register(data: RegisterInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existingUser) {
            throw new AppError('User already exists', 409)
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

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

        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
            expiresIn: '7d',
        })

        return { user, token }
    }

    static async login(data: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        })

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
    }

    static async getMe(payload: { userId: string }) {
        const dbUser = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        })
        return dbUser
    }
}
