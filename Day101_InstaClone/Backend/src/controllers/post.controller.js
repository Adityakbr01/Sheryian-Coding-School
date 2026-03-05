const STATUS_CODES = require("../constants/statusCodes");
const postService = require("../services/post.service");
const ApiResponse = require("../utils/apiResponse");

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
  createPost: async (req, res, next) => {
    
    try {
      const userId = req?.user?._id || "69a8198088c3200bb5de474d"; // todo remove and add a middleware to send required values
      const result = await postService.createPost(req.body, userId, req?.file);

      return ApiResponse.success(res, {
        status: STATUS_CODES.CREATED,
        message: result.message,
        data: { post: result.post },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = postController;
