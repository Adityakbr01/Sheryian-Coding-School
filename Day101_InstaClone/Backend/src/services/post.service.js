const postRepository = require("../repository/post.repository");
const statusMessage = require("../constants/statusMessages");
const uploadToImageKit = require("../utils/uploadToImageKit");

/**
 * =========================================
 * POST SERVICE
 * =========================================
 * @description Handles business logic related
 *              to Post operations.
 */

const postService = {
  /**
   * ------------------------------------------------
   * @route   POST /api/v1/post
   * @desc    Create a new post
   * @access  Authenticated
   *
   * @param   {Object} data - { caption, postImageUrl }
   * @param   {String} userId - ID of the authenticated user
   *
   * @returns
   *  - 201 : Post created successfully
   *  - 400 : Validation error
   */
  createPost: async (data, userId, imageFile) => {
    const { caption } = data;

    if (!caption) {
      throw new Error("Caption is required");
    }

    // Upload image to ImageKit if a file was provided
    let postImageUrl;
    if (imageFile) {
      postImageUrl = await uploadToImageKit(imageFile, "Posts");
    }

    const post = await postRepository.createPost({
      ...data,
      createdBy: userId,
      ...(postImageUrl && { postImageUrl }),
    });

    return {
      post,
      message: statusMessage.postCreated,
    };
  },
};

module.exports = postService;
