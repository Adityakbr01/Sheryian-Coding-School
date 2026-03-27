import { Response } from 'express'
import { MemoryService } from './memory.service'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { AuthRequest } from '../../middleware/auth.middleware'

export const getDueItems = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const items = await MemoryService.getDueItems(req.user!.userId)
    res
      .status(200)
      .json(new ApiResponse(200, items, `${items.length} items due for review`))
  },
)

export const markReviewed = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const item = await MemoryService.markReviewed(
      req.user!.userId,
      req.params.itemId,
    )
    res.status(200).json(new ApiResponse(200, item, 'Item marked as reviewed'))
  },
)

export const getResurfacedItems = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const items = await MemoryService.getResurfacedItems(req.user!.userId)
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          items,
          'Resurfaced generic insights explicitly mapped',
        ),
      )
  },
)
