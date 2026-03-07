const likeRepository = require("../repository/like.repository");
const postRepository = require("../repository/post.repository");
const ApiError = require("../utils/apiError");
const STATUS_CODES = require("../constants/statusCodes");
const statusMessage = require("../constants/statusMessages");

/**
 * =========================================
 * LIKE SERVICE
 * =========================================
 * @description Business logic layer for Like operations.
 *              Validates that the post exists, then delegates
 *              all DB work to likeRepository.
 * @module services/like.service
 */

const likeService = {
  /**
   * ------------------------------------------------
   * @function toggleLike
   * @desc     Like a post if not yet liked; unlike if already liked.
   *           likeCount is derived from countDocuments — always accurate.
   * ------------------------------------------------
   *
   * Business Rules:
   * 1. Post must exist (404 Not Found)
   * 2. If a Like document already exists for this post/user → delete it (unlike)
   * 3. If no Like document exists → create one (like)
   * 4. Return accurate likeCount directly from the Like collection
   *
   * @param   {String} postId – MongoDB ObjectId string
   * @param   {String} userId – authenticated user's ObjectId
   * @returns {{ liked: Boolean, likeCount: Number, message: String }}
   * @throws  {ApiError} 404 if post not found
   */
  toggleLike: async (postId, userId) => {
    // 1. Verify the post exists before touching the Like collection
    const post = await postRepository.findPostById(postId);
    if (!post) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, statusMessage.postNotFound);
    }

    // 2. Check for an existing Like document for this post/user pair
    const existingLike = await likeRepository.findLikeRecord(postId, userId);

    if (existingLike) {
      // Already liked → remove the Like document (unlike)
      await likeRepository.deleteLikeRecord(postId, userId);
    } else {
      // Not yet liked → create a new Like document
      await likeRepository.createLikeRecord(postId, userId);
    }

    // 3. Derive likeCount directly from the Like collection (always in sync)
    const likeCount = await likeRepository.countLikes(postId);

    return {
      liked: !existingLike,   // true = just liked, false = just unliked
      likeCount,
      message: existingLike ? statusMessage.postUnliked : statusMessage.postLiked,
    };
  },
};

module.exports = likeService;
