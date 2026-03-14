import { Request, Response } from 'express';
import { AuthService } from 'modules/auth/auth.service';
import { catchAsync } from 'utils/catchAsync';
import { ApiResponse } from 'utils/ApiResponse';
import { AppError } from 'utils/AppError';

export class AuthController {
  private authService = new AuthService();

  register = catchAsync(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const token = await this.authService.register(email, password, name);
    res.status(201).json(new ApiResponse(201, 'User registered successfully', { token }));
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const token = await this.authService.login(email, password);
    res.status(200).json(new ApiResponse(200, 'Login successful', { token }));
  });

  googleCallback = catchAsync(async (req: Request, res: Response) => {
    // Passport handles much of this, but here we can return the token or handle redirection
    const user = req.user as any;
    if (!user) {
      throw new AppError('Authentication failed', 401);
    }

    const token = await this.authService.googleCallback(user);

    let redirectUrl = 'perplexity://auth/callback'; // Default fallback

    if (req.query.state) {
      try {
        const stateStr = Buffer.from(req.query.state as string, 'base64').toString('utf-8');
        const stateObj = JSON.parse(stateStr);
        if (stateObj.redirectUrl) {
          redirectUrl = stateObj.redirectUrl;
        }
      } catch (e) {
        console.error('Failed to parse OAuth state parameter:', e);
      }
    }

    const separator = redirectUrl.includes('?') ? '&' : '?';
    res.redirect(`${redirectUrl}${separator}token=${token}`);
  });
}
