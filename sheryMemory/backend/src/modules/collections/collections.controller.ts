import { Response } from 'express'
import { CollectionsService } from './collections.service'
import { catchAsync } from '../../utils/catchAsync'
import { ApiResponse } from '../../utils/ApiResponse'
import { createCollectionSchema, updateCollectionSchema, addItemToCollectionSchema } from './collections.schema'
import { AuthRequest } from '../../middleware/auth.middleware'

export const createCollection = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = createCollectionSchema.parse(req.body)
    const collection = await CollectionsService.create(req.user!.userId, data)
    res.status(201).json(new ApiResponse(201, collection, 'Collection created'))
})

export const getCollections = catchAsync(async (req: AuthRequest, res: Response) => {
    const collections = await CollectionsService.getAll(req.user!.userId)
    res.status(200).json(new ApiResponse(200, collections, 'Collections fetched'))
})

export const getCollection = catchAsync(async (req: AuthRequest, res: Response) => {
    const collection = await CollectionsService.getById(req.user!.userId, req.params.id)
    res.status(200).json(new ApiResponse(200, collection, 'Collection fetched'))
})

export const updateCollection = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = updateCollectionSchema.parse(req.body)
    const collection = await CollectionsService.update(req.user!.userId, req.params.id, data)
    res.status(200).json(new ApiResponse(200, collection, 'Collection updated'))
})

export const deleteCollection = catchAsync(async (req: AuthRequest, res: Response) => {
    await CollectionsService.delete(req.user!.userId, req.params.id)
    res.status(200).json(new ApiResponse(200, null, 'Collection deleted'))
})

export const addItemToCollection = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = addItemToCollectionSchema.parse(req.body)
    const item = await CollectionsService.addItem(req.user!.userId, req.params.id, data.itemId)
    res.status(200).json(new ApiResponse(200, item, 'Item added to collection'))
})

export const removeItemFromCollection = catchAsync(async (req: AuthRequest, res: Response) => {
    await CollectionsService.removeItem(req.user!.userId, req.params.id, req.params.itemId)
    res.status(200).json(new ApiResponse(200, null, 'Item removed from collection'))
})
