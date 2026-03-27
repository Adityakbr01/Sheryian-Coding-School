import { Response, NextFunction } from 'express'
import { imagekit } from '../../config/imagekit'
import { ItemsService } from './items.service'
import { AuthRequest } from '../../middleware/auth.middleware'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { AppError } from '../../utils/AppError'

export class ItemsController {
  static save = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError('Unauthorized', 401))

      let finalUrl = req.body.url

      if (req.file) {
        try {
          const uploadRes = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: '/sherymemory/items',
          })
          finalUrl = uploadRes.url
        } catch (error) {
          return next(new AppError('Failed to upload file to ImageKit', 500))
        }
      }

      if (!finalUrl) {
        return next(new AppError('A URL or file must be provided', 400))
      }

      const item = await ItemsService.saveItem(req.user.userId, { url: finalUrl, collectionId: req.body.collectionId })
      res
        .status(201)
        .json(new ApiResponse(201, item, 'Item saved successfully'))
    },
  )

  static list = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError('Unauthorized', 401))

      const { collectionId } = req.query as { collectionId?: string }
      const items = await ItemsService.getItems(req.user.userId, collectionId)
      res
        .status(200)
        .json(new ApiResponse(200, items, 'Items retrieved successfully'))
    },
  )

  static search = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError('Unauthorized', 401))

      const { q, limit } = req.query as { q?: string; limit?: string }
      if (!q) {
        return next(new AppError('Search query (q) is required', 400))
      }

      const items = await ItemsService.searchItems(
        req.user.userId,
        q,
        limit ? parseInt(limit) : 10,
      )
      res
        .status(200)
        .json(new ApiResponse(200, items, 'Search completed successfully'))
    },
  )

  static getById = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError('Unauthorized', 401))

      const { id } = req.params
      const item = await ItemsService.getItemById(req.user.userId, id)
      res
        .status(200)
        .json(new ApiResponse(200, item, 'Item retrieved successfully'))
    },
  )

  static remove = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError('Unauthorized', 401))

      const { id } = req.params
      await ItemsService.deleteItem(req.user.userId, id)
      res
        .status(200)
        .json(new ApiResponse(200, null, 'Item deleted successfully'))
    },
  )
}
