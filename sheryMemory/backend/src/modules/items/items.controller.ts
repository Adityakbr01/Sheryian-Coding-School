import { Response, NextFunction } from 'express'
import { ItemsService } from './items.service'
import { AuthRequest } from '../../middleware/auth.middleware'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { AppError } from '../../utils/AppError'

export class ItemsController {
    static save = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return next(new AppError('Unauthorized', 401))

        const item = await ItemsService.saveItem(req.user.userId, req.body)
        res.status(201).json(new ApiResponse(201, item, 'Item saved successfully'))
    })

    static list = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return next(new AppError('Unauthorized', 401))

        const { collectionId } = req.query as { collectionId?: string }
        const items = await ItemsService.getItems(req.user.userId, collectionId)
        res.status(200).json(new ApiResponse(200, items, 'Items retrieved successfully'))
    })

    static remove = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return next(new AppError('Unauthorized', 401))

        const { id } = req.params
        await ItemsService.deleteItem(req.user.userId, id)
        res.status(200).json(new ApiResponse(200, null, 'Item deleted successfully'))
    })
}
