import logger from '@/utils/logger';
import { Server, Socket } from 'socket.io';
import { AiService } from '@/modules/ai/ai.service';
import { AuthRequest } from '@/middlewares/auth.middleware';

let io: Server | null = null;

export function initSocketIO(server: any) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    logger.info('Socket.io initialized');

    io.on('connection', (socket: Socket) => {
        logger.info('A user connected:', socket.id);

        socket.on("join_chat", (chatId: string) => {
            socket.join(chatId);
            logger.info(`Socket ${socket.id} joined chat: ${chatId}`);
        });

        socket.on("send_message", async ({ chatId, prompt, userId }: { chatId: string | null, prompt: string, userId: string }) => {
            if (!prompt || !userId) {
                return socket.emit("error", "Missing userId or prompt");
            }

            try {
                // Ensure chat exists or create one, handled by AiService
                await AiService.handleSocketChat(userId, chatId, prompt, socket);
            } catch (error: any) {
                logger.error('Error handling socket message', error);
                socket.emit('error', `Failed to process message: ${error.message || error}`);
            }
        });

        socket.on('disconnect', () => {
            logger.info('User disconnected:', socket.id);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}