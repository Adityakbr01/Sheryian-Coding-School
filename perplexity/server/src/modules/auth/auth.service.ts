import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from "@prisma/client";
import env from 'configs/ENV';
import { AuthRepository } from 'modules/auth/auth.repository';



export class AuthService {
  private authRepository = new AuthRepository();

  async register(email: string, password?: string, name?: string) {
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await this.authRepository.createUser({
      email,
      password: hashedPassword,
      name,
    });

     const result = { token: this.generateToken(user), user };
     return result;
  }

  async login(email: string, password?: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.password && password) {
      throw new Error('Please login with your social account');
    }

    if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
    }

    const result = { token: this.generateToken(user), user };
    return result;
  }

  generateToken(user: User) {
    const payload = { id: user.id, email: user.email };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
  }

  async googleCallback(user: User) {
    return this.generateToken(user);
  }
}
