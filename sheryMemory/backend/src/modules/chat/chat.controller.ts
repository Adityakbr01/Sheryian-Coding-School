import { Response, NextFunction } from 'express'
import { ChatService } from './chat.service'
import { AuthRequest } from '../../middleware/auth.middleware'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { AppError } from '../../utils/AppError'

export const getSessions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401))
  const sessions = await ChatService.getSessions(req.user.userId)
  res.status(200).json(new ApiResponse(200, sessions, 'Sessions retrieved successfully'))
})

export const createSession = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401))
  const { title } = req.body
  const session = await ChatService.createSession(req.user.userId, title)
  res.status(201).json(new ApiResponse(201, session, 'Session created successfully'))
})

export const getSessionMessages = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401))
  const { id } = req.params
  const messages = await ChatService.getSessionMessages(req.user.userId, id)
  res.status(200).json(new ApiResponse(200, messages, 'Messages retrieved successfully'))
})

export const sendMessage = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401))
  const { id } = req.params
  const { content, mode } = req.body
  if (!content) return next(new AppError('Message content is required', 400))
  const response = await ChatService.sendMessage(req.user.userId, id, content, mode)
  res.status(200).json(new ApiResponse(200, response, 'Message sent successfully'))
})

export const deleteSession = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401))
  const { id } = req.params
  await ChatService.deleteSession(req.user.userId, id)
  res.status(200).json(new ApiResponse(200, null, 'Session deleted successfully'))
})

export const streamMessage = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401))
  const { id } = req.params
  const { content, mode, regenerate } = req.body
  if (!content) return next(new AppError('Message content is required', 400))

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  await ChatService.streamMessage(req.user.userId, id, content, res, mode, regenerate)
})

