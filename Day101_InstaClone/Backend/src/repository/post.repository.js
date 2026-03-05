const postModel = require("../model/post.model");

/**
 * =========================================
 * POST REPOSITORY
 * =========================================
 * @description Handles all database operations
 *              related to Posts.
 *              This layer directly communicates
 *              with the database (MongoDB).
 */

const postRepository = {
  /**
   * ------------------------------------------------
   * @function createPost
   * @desc    Create a new post in the database
   * @access  Internal
   * @param   {Object} data - post data
   * @returns {Object} created post document
   */
  createPost: async (data) => {
    return await postModel.create(data);
  },
};

module.exports = postRepository;
