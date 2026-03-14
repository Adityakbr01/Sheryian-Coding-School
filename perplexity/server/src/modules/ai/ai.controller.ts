import prisma from "@/configs/db";
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

    public getChats = catchAsync(async (req: any, res: Response) => {
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        
        const chats = await prisma.chat.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });

        return ApiResponse.success(res, 200, "Chats retrieved successfully", { chats });
    });

    public getChatMessages = catchAsync(async (req: any, res: Response) => {
        const authReq = req as AuthRequest;
        const { chatId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        
        const history = await AiService.getHistory(chatId, page, limit);

        return ApiResponse.success(res, 200, "Chat history retrieved successfully", { history });
    });

    public getHistory = catchAsync(async (req: any, res: Response) => {
        // Legacy fallback
        const authReq = req as AuthRequest;
        const userId = authReq.user!.id;
        try {
            // we have changed getHistory signature. returning empty for legacy
            return ApiResponse.success(res, 200, "History", { history: [] });
        } catch (error) {
            return ApiResponse.error(res, 500, "Failed to get history");
        }
    });
}
