import { Response } from 'express'
import { GraphService } from './graph.service'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { AuthRequest } from '../../middleware/auth.middleware'

export const getGraph = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = await GraphService.getGraphData(req.user!.userId)
    res.status(200).json(new ApiResponse(200, data, 'Graph mapped'))
})

export const syncGraph = catchAsync(async (req: AuthRequest, res: Response) => {
    await GraphService.syncSemanticRelations(req.user!.userId)
    res.status(200).json(new ApiResponse(200, null, 'Semantic graph relations synchronized'))
})

export const getRelatedItems = catchAsync(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params
    const limit = parseInt(req.query.limit as string) || 5
    const data = await GraphService.getRelatedItems(req.user!.userId, itemId, limit)
    res.status(200).json(new ApiResponse(200, data, 'Related items fetched'))
})
