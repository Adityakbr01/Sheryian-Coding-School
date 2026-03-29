import {
  CreateCollectionInput,
  UpdateCollectionInput,
} from './collections.schema'
import { AppError } from '../../utils/AppError'
import { CollectionsDao } from './collections.dao'

export const CollectionsService = {
  async create(userId: string, data: CreateCollectionInput) {
    return CollectionsDao.create(userId, data)
  },

  async getAll(userId: string) {
    return CollectionsDao.findAllByUser(userId)
  },

  async getById(userId: string, id: string) {
    const collection = await CollectionsDao.findById(id, userId)
    if (!collection) {
      throw new AppError('Collection not found', 404)
    }
    return collection
  },

  async update(userId: string, id: string, data: UpdateCollectionInput) {
    const collection = await CollectionsDao.findBasicById(id, userId)
    if (!collection) {
      throw new AppError('Collection not found', 404)
    }
    return CollectionsDao.update(id, data)
  },

  async delete(userId: string, id: string) {
    const collection = await CollectionsDao.findBasicById(id, userId)
    if (!collection) {
      throw new AppError('Collection not found', 404)
    }

    // Remove collection reference from items first, then delete
    await CollectionsDao.unlinkItemsFromCollection(id)
    await CollectionsDao.delete(id)

    return { success: true }
  },

  async addItem(userId: string, collectionId: string, itemId: string) {
    // Verify both exist and belong to the user
    const [collection, item] = await Promise.all([
      CollectionsDao.findBasicById(collectionId, userId),
      CollectionsDao.findItemById(itemId, userId),
    ])

    if (!collection) throw new AppError('Collection not found', 404)
    if (!item) throw new AppError('Item not found', 404)

    return CollectionsDao.updateItemCollection(itemId, collectionId)
  },

  async removeItem(
    userId: string,
    collectionId: string,
    itemId: string,
  ) {
    const item = await CollectionsDao.findItemById(itemId, userId, collectionId)
    if (!item) throw new AppError('Item not found in this collection', 404)

    return CollectionsDao.updateItemCollection(itemId, null)
  },
}

