import { AuthRequest } from "@/middlewares/auth.middleware";
import { AiService } from "@/modules/ai/ai.service";
import { ApiResponse } from "@/utils/ApiResponse";
import { catchAsync } from "@/utils/catchAsync";
import { Response } from "express";

export class AiController {
    public chat = catchAsync(async (req: any, res: Response) => {
        const authReq = req as AuthRequest;
        const { prompt } = authReq.body;
        const userId = authReq.user!.id;

        if (!prompt) {
            return ApiResponse.error(res, 400, "Prompt is required");
        }

        const response = await AiService.handleChat(userId, prompt);
        
        return ApiResponse.success(res, 200, "AI response generated successfully", { response });
    });

    public getHistory = catchAsync(async (req: any, res: Response) => {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        const history = await AiService.getHistory(userId);

        return ApiResponse.success(res, 200, "Chat history retrieved successfully", { history });
    });
}
