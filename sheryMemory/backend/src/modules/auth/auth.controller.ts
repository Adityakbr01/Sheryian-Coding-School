import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'

export class AuthController {
    static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const result = await AuthService.register(req.body)
        res.status(201).json(new ApiResponse(201, result, 'User registered successfully'))
    })

    static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const result = await AuthService.login(req.body)
        res.status(200).json(new ApiResponse(200, result, 'Login successful'))
    })
}
