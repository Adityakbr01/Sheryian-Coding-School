const STATUS_CODES = require("../constants/statusCodes");
const postService = require("../services/post.service");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * =========================================
 * POST CONTROLLER
 * =========================================
 * @description Thin layer between HTTP and the service layer.
 *              Extracts request data, delegates to postService,
 *              and sends a standardised API response.
 * @module controllers/post.controller
 */

const postController = {
  // ─────────────────────────────────────────────
  //  CREATE
  // ─────────────────────────────────────────────

  /**
   * @route   POST /api/v1/post
   * @desc    Create a new post for the authenticated user
   * @access  Authenticated
   * @body    caption   {String} required
   * @body    postImage {File}   optional (multipart/form-data)
   * @returns 201 – created post document
   */
  createPost: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const result = await postService.createPost(req.body, userId, req?.file);

    return ApiResponse.success(res, {
      status: STATUS_CODES.CREATED,
      message: result.message,
      data: { post: result.post },
    });
  }),

  // ─────────────────────────────────────────────
  //  READ – public
  // ─────────────────────────────────────────────

  /**
   * @route   GET /api/v1/post
   * @desc    Fetch all posts (latest first) with cursor-based pagination
   * @access  Public
   * @query   page  {Number} default 1
   * @query   limit {Number} default 10
   * @returns 200 – paginated posts array + pagination meta
   */
  getAllPosts: asyncHandler(async (req, res) => {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await postService.getAllPosts(page, limit);

    return ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
      data: result.data,
    });
  }),

  /**
   * @route   GET /api/v1/post/:postId
   * @desc    Fetch a single post with populated creator info
   * @access  Public
   * @param   postId – MongoDB ObjectId of the post
   * @returns 200 – post document  |  404 – not found
   */
  getPostById: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const result = await postService.getPostById(postId);

    return ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
      data: { post: result.post },
    });
  }),

  // ─────────────────────────────────────────────
  //  READ – authenticated
  // ─────────────────────────────────────────────

  /**
   * @route   GET /api/v1/post/my/posts
   * @desc    Fetch all posts created by the logged-in user
   * @access  Authenticated
   * @query   page  {Number} default 1
   * @query   limit {Number} default 10
   * @returns 200 – paginated posts + pagination meta
   */
  getMyPosts: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const result = await postService.getMyPosts(userId, page, limit);

    return ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
      data: result.data,
    });
  }),

  // ─────────────────────────────────────────────
  //  UPDATE
  // ─────────────────────────────────────────────

  /**
   * @route   PUT /api/v1/post/:postId
   * @desc    Update caption or image of an existing post (owner only)
   * @access  Authenticated
   * @param   postId – MongoDB ObjectId of the post
   * @body    caption   {String} optional
   * @body    postImage {File}   optional (multipart/form-data)
   * @returns 200 – updated post document  |  403 – not owner  |  404 – not found
   */
  updatePost: asyncHandler(async (req, res) => {
    const userId  = req.user.userId;
    const { postId } = req.params;
    const result  = await postService.updatePost(postId, userId, req.body, req?.file);

    return ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
      data: { post: result.post },
    });
  }),

  // ─────────────────────────────────────────────
  //  DELETE
  // ─────────────────────────────────────────────

  /**
   * @route   DELETE /api/v1/post/:postId
   * @desc    Permanently delete a post (owner only)
   * @access  Authenticated
   * @param   postId – MongoDB ObjectId of the post
   * @returns 200 – success message  |  403 – not owner  |  404 – not found
   */
  deletePost: asyncHandler(async (req, res) => {
    const userId     = req.user.userId;
    const { postId } = req.params;
    const result     = await postService.deletePost(postId, userId);

    return ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
      data: null,
    });
  }),

  // ─────────────────────────────────────────────
  //  LIKE / UNLIKE  (toggle)
  // ─────────────────────────────────────────────

  /**
   * @route   POST /api/v1/post/:postId/like
   * @desc    Like the post if not already liked; unlike if already liked
   * @access  Authenticated
   * @param   postId – MongoDB ObjectId of the post
   * @returns 200 – { liked: Boolean, likeCount: Number }
   */
  toggleLike: asyncHandler(async (req, res) => {
    const userId     = req.user.userId;
    const { postId } = req.params;
    const result     = await postService.toggleLike(postId, userId);

    return ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
      data: { liked: result.liked, likeCount: result.likeCount },
    });
  }),
};

module.exports = postController;
