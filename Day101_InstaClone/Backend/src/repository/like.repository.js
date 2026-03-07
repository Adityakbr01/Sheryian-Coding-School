const likeModel = require("../model/like.model");

/**
 * =========================================
 * LIKE REPOSITORY
 * =========================================
 * @description Sole layer that communicates directly with the Like collection.
 *              No business logic lives here — only raw DB operations.
 * @module repository/like.repository
 */

const likeRepository = {
  /**
   * @desc    Check whether a user has already liked a post.
   * @param   {String} postId – MongoDB ObjectId string
   * @param   {String} userId – user's ObjectId string
   * @returns {Object|null} like document or null
   */
  findLikeRecord: async (postId, userId) => {
    return await likeModel.findOne({ post: postId, likedBy: userId });
  },

  /**
   * @desc    Persist a new like document for a post.
   * @param   {String} postId – MongoDB ObjectId string
   * @param   {String} userId – user's ObjectId string
   * @returns {Object} newly created like document
   */
  createLikeRecord: async (postId, userId) => {
    return await likeModel.create({ post: postId, likedBy: userId });
  },

  /**
   * @desc    Remove the like document for a post/user pair.
   * @param   {String} postId – MongoDB ObjectId string
   * @param   {String} userId – user's ObjectId string
   * @returns {Object} deletion result
   */
  deleteLikeRecord: async (postId, userId) => {
    return await likeModel.deleteOne({ post: postId, likedBy: userId });
  },

  /**
   * @desc    Count all likes for a given post.
   * @param   {String} postId – MongoDB ObjectId string
   * @returns {Number} total like count
   */
  countLikes: async (postId) => {
    return await likeModel.countDocuments({ post: postId });
  },
};

module.exports = likeRepository;
