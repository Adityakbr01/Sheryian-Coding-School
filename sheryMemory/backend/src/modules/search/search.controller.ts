import { Response } from 'express'
import { SearchService } from './search.service'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { searchQuerySchema } from './search.schema'
import { AuthRequest } from '../../middleware/auth.middleware'

export const searchItems = catchAsync(
  async (req: AuthRequest, res: Response) => {
    // 1. Validate query inputs
    const validatedData = searchQuerySchema.parse(req.query)

    // 2. userId is guaranteed by the authMiddleware
    const userId = req.user!.userId

    // 3. Perform Vector Search
    const results = await SearchService.searchItems(
      userId,
      validatedData.q,
      validatedData.limit,
    )

    // 4. Send top results
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          results,
          `Found ${(results as any[]).length || 0} similar items for query: "${validatedData.q}"`,
        ),
      )
  },
)
