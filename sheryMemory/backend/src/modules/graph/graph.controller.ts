import { Response } from 'express'
import { GraphService } from './graph.service'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { AuthRequest } from '../../middleware/auth.middleware'

export const getGraph = catchAsync(async (req: AuthRequest, res: Response) => {
    const graph = await GraphService.getGraph(req.user!.userId)
    res.status(200).json(new ApiResponse(200, graph, 'Knowledge graph fetched'))
})
