import { Response } from 'express'
import { HighlightService } from './highlights.service'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { AuthRequest } from '../../middleware/auth.middleware'

export const createHighlight = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { itemId, section = 'content', text, start, end, color } = req.body
    const highlight = await HighlightService.create(req.user!.userId, {
      itemId,
      section,
      text,
      start,
      end,
      color,
    })
    res.status(201).json(new ApiResponse(201, highlight, 'Highlight created'))
  },
)

// Get ALL highlights for dashboard (optional ?color= filter)
export const getAllHighlights = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { color, page, limit, search, sortBy } = req.query as { color?: string; page?: string; limit?: string; search?: string; sortBy?: string };
    const highlights = await HighlightService.getAll(
      req.user!.userId,
      color,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      search,
      sortBy
    )
    res
      .status(200)
      .json(new ApiResponse(200, highlights, 'All highlights fetched'))
  },
)

// Get highlights for a specific item
export const getItemHighlights = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params
    const highlights = await HighlightService.getByItemId(
      req.user!.userId,
      itemId,
    )
    res
      .status(200)
      .json(new ApiResponse(200, highlights, 'Item highlights fetched'))
  },
)

export const deleteHighlight = catchAsync(
  async (req: AuthRequest, res: Response) => {
    await HighlightService.delete(req.user!.userId, req.params.id)
    res.status(200).json(new ApiResponse(200, null, 'Highlight deleted'))
  },
)

// Clear ALL highlights for a specific item
export const clearItemHighlights = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await HighlightService.clearByItemId(
      req.user!.userId,
      req.params.itemId,
    )
    res.status(200).json(new ApiResponse(200, result, 'All highlights cleared'))
  },
)
