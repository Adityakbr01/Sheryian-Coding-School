const postRepository = require("../repository/post.repository");
const statusMessage = require("../constants/statusMessages");
const uploadToImageKit = require("../utils/uploadToImageKit");
const ApiError = require("../utils/apiError");
const STATUS_CODES = require("../constants/statusCodes");

/**
 * =========================================
 * POST SERVICE
 * =========================================
 * @description Handles all business logic related to Post operations.
 *              Validates input, orchestrates image uploads, and
 *              delegates persistence to postRepository.
 * @module services/post.service
 */

const postService = {
  // ─────────────────────────────────────────────
  //  CREATE
  // ─────────────────────────────────────────────

  /**
   * @desc    Validate input, optionally upload image, then persist a new post.
   * @param   {Object} data       – request body { caption }
   * @param   {String} userId     – authenticated user's ObjectId
   * @param   {Object} imageFile  – multer file object (optional)
   * @returns {{ post: Object, message: String }}
   * @throws  400 if caption is missing
   */
  createPost: async (data, userId, imageFile) => {
    const { caption } = data;

    if (!caption) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, statusMessage.capRe);
    }

    // Upload image to ImageKit (cloud CDN) only when a file is attached
    let postImageUrl;
    if (imageFile) {
      postImageUrl = await uploadToImageKit(imageFile, "Posts");
    }

    const post = await postRepository.createPost({
      caption,
      createdBy: userId,
      ...(postImageUrl && { postImageUrl }),
    });

    return { post, message: statusMessage.postCreated };
  },

  // ─────────────────────────────────────────────
  //  READ – public
  // ─────────────────────────────────────────────

  /**
   * @desc    Return all posts sorted by newest first with pagination.
   * @param   {Number} page  – current page (1-indexed)
   * @param   {Number} limit – items per page
   * @returns {{ data: { posts, pagination }, message: String }}
   */
  getAllPosts: async (page, limit) => {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      postRepository.findAllPosts(skip, limit),
      postRepository.countPosts({}),
    ]);

    return {
      message: "Posts fetched successfully",
      data: {
        posts,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    };
  },

  /**
   * @desc    Return a single post by its ObjectId.
   * @param   {String} postId – MongoDB ObjectId string
   * @returns {{ post: Object, message: String }}
   * @throws  404 if post does not exist
   */
  getPostById: async (postId) => {
    const post = await postRepository.findPostById(postId);

    if (!post) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, statusMessage.postNotFound);
    }

    return { post, message: "Post fetched successfully" };
  },

  // ─────────────────────────────────────────────
  //  READ – authenticated
  // ─────────────────────────────────────────────

  /**
   * @desc    Return all posts belonging to the authenticated user.
   * @param   {String} userId – authenticated user's ObjectId
   * @param   {Number} page
   * @param   {Number} limit
   * @returns {{ data: { posts, pagination }, message: String }}
   */
  getMyPosts: async (userId, page, limit) => {
    const skip = (page - 1) * limit;
    const filter = { createdBy: userId };
    const [posts, total] = await Promise.all([
      postRepository.findPostsByUser(userId, skip, limit),
      postRepository.countPosts(filter),
    ]);

    return {
      message: "Your posts fetched successfully",
      data: {
        posts,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    };
  },

  // ─────────────────────────────────────────────
  //  UPDATE
  // ─────────────────────────────────────────────

  /**
   * @desc    Update caption and/or image of a post. Only the owner may update.
   * @param   {String} postId    – MongoDB ObjectId string
   * @param   {String} userId    – authenticated user's ObjectId
   * @param   {Object} data      – { caption } (partial update)
   * @param   {Object} imageFile – multer file object (optional)
   * @returns {{ post: Object, message: String }}
   * @throws  404 if post not found | 403 if not the owner
   */
  updatePost: async (postId, userId, data, imageFile) => {
    const post = await postRepository.findPostById(postId);

    if (!post) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, statusMessage.postNotFound);
    }

    // Only the creator is allowed to edit their own post
    // createdBy is populated, so we compare via ._id
    if (post.createdBy._id.toString() !== userId) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, statusMessage.notAuthorized);
    }

    const updates = {};

    if (data.caption) updates.caption = data.caption;

    // Re-upload image to ImageKit when a new file is attached
    if (imageFile) {
      updates.postImageUrl = await uploadToImageKit(imageFile, "Posts");
    }

    // Flag the post as edited with the current timestamp
    updates.isEdited = true;
    updates.editedAt = new Date();

    const updatedPost = await postRepository.updatePost(postId, updates);

    return { post: updatedPost, message: statusMessage.postUpdated };
  },

  // ─────────────────────────────────────────────
  //  DELETE
  // ─────────────────────────────────────────────

  /**
   * @desc    Permanently delete a post. Only the owner may delete.
   * @param   {String} postId – MongoDB ObjectId string
   * @param   {String} userId – authenticated user's ObjectId
   * @returns {{ message: String }}
   * @throws  404 if post not found | 403 if not the owner
   */
  deletePost: async (postId, userId) => {
    const post = await postRepository.findPostById(postId);

    if (!post) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, statusMessage.postNotFound);
    }

    // createdBy is populated, so we compare via ._id
    if (post.createdBy._id.toString() !== userId) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, statusMessage.notAuthorized);
    }

    await postRepository.deletePost(postId);

    return { message: statusMessage.postDeleted };
  },

  // ─────────────────────────────────────────────
  //  LIKE / UNLIKE  (toggle)
  // ─────────────────────────────────────────────

  /**
   * @desc    Toggle a like on a post.
   *          Adds userId to `likes` array if not present (like),
   *          removes it if already present (unlike).
   *          Keeps `likeCount` field in sync atomically.
   * @param   {String} postId – MongoDB ObjectId string
   * @param   {String} userId – authenticated user's ObjectId
   * @returns {{ liked: Boolean, likeCount: Number, message: String }}
   * @throws  404 if post not found
   */
  toggleLike: async (postId, userId) => {
    const post = await postRepository.findPostById(postId);

    if (!post) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, statusMessage.postNotFound);
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    const updatedPost = alreadyLiked
      ? await postRepository.unlikePost(postId, userId)   // pull userId from likes
      : await postRepository.likePost(postId, userId);    // push userId into likes

    return {
      liked: !alreadyLiked,
      likeCount: updatedPost.likeCount,
      message: alreadyLiked ? statusMessage.postUnliked : statusMessage.postLiked,
    };
  },
};

module.exports = postService;
