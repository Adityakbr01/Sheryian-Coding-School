import { Response } from 'express'
import { HighlightsService } from './highlights.service'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { createHighlightSchema } from './highlights.schema'
import { AuthRequest } from '../../middleware/auth.middleware'

export const createHighlight = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = createHighlightSchema.parse(req.body)
    const highlight = await HighlightsService.create(req.user!.userId, data)
    res.status(201).json(new ApiResponse(201, highlight, 'Highlight saved'))
})

export const getHighlights = catchAsync(async (req: AuthRequest, res: Response) => {
    const highlights = await HighlightsService.getAll(req.user!.userId)
    res.status(200).json(new ApiResponse(200, highlights, 'Highlights fetched'))
})

export const deleteHighlight = catchAsync(async (req: AuthRequest, res: Response) => {
    await HighlightsService.delete(req.user!.userId, req.params.id)
    res.status(200).json(new ApiResponse(200, null, 'Highlight deleted'))
})
