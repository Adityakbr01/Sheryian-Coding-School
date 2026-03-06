const STATUS_CODES = require("../constants/statusCodes");
const postService = require("../services/post.service");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * =========================================
 * POST CONTROLLER
 * =========================================
 * @description Handles Post crud logic
 *              such as create a post.
 * @module controllers/postController
 */

const postController = {
  /**
   * ------------------------------------------------
   * @route   POST /api/v1/post
   * @desc    create a new post
   * @access  AUTHENTICATED
   *
   * @body
   *  - createdBy {String} Required
   *  - caption    {String} Required
   *  - postImageUrl {blob} Optional
   *
   * @returns
   *  - 201 : Post created successfully
   *  - 400 : Validation error
   */
  createPost: asyncHandler(async (req, res, next) => {
    const userId = req?.user?.userId;
    const result = await postService.createPost(req.body, userId, req?.file);

    return ApiResponse.success(res, {
      status: STATUS_CODES.CREATED,
      message: result.message,
      data: { post: result.post },
    });
  }),
};

module.exports = postController;
