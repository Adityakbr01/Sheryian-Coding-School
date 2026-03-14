import { Request, Response } from 'express';
import { AuthService } from 'modules/auth/auth.service';
import { ApiResponse } from 'utils/ApiResponse';
import { catchAsync } from 'utils/catchAsync';

export class AuthController {
  private authService = new AuthService();

  register = catchAsync(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const { token , user} = await this.authService.register(email, password, name);
    ApiResponse.success(res, 201, 'Registration successful', { token, user });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { token, user } = await this.authService.login(email, password);
    ApiResponse.success(res, 200, 'Login successful', { token, user });
  });

  googleCallback = catchAsync(async (req: Request, res: Response) => {
    // Passport handles much of this, but here we can return the token or handle redirection
    const user = req.user as any;
    if (!user) {
      ApiResponse.error(res, 401, 'Authentication failed');
      return;
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
