const postModel = require("../model/post.model");

/**
 * =========================================
 * POST REPOSITORY
 * =========================================
 * @description Sole layer that communicates directly with MongoDB.
 *              No business logic lives here — only raw DB operations.
 * @module repository/post.repository
 */

const postRepository = {
  // ─────────────────────────────────────────────
  //  CREATE
  // ─────────────────────────────────────────────

  /**
   * @desc    Insert a new post document into the database.
   * @param   {Object} data – { caption, createdBy, postImageUrl? }
   * @returns {Object} newly created post document
   */
  createPost: async (data) => {
    return await postModel.create(data);
  },

  // ─────────────────────────────────────────────
  //  READ
  // ─────────────────────────────────────────────

  /**
   * @desc    Fetch all posts sorted by newest, with skip/limit pagination.
   *          Populates creator's username and profileImageUrl.
   * @param   {Number} skip  – number of documents to skip
   * @param   {Number} limit – max documents to return
   * @returns {Array<Object>} array of post documents
   */
  findAllPosts: async (skip, limit) => {
    return await postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "username profileImageUrl");
  },

  /**
   * @desc    Find a single post by its ObjectId.
   *          Populates creator's username and profileImageUrl.
   * @param   {String} postId – MongoDB ObjectId string
   * @returns {Object|null} post document or null
   */
  findPostById: async (postId) => {
    return await postModel
      .findById(postId)
      .populate("createdBy", "username profileImageUrl");
  },

  /**
   * @desc    Fetch all posts belonging to a specific user.
   * @param   {String} userId – MongoDB ObjectId string
   * @param   {Number} skip
   * @param   {Number} limit
   * @returns {Array<Object>} array of post documents
   */
  findPostsByUser: async (userId, skip, limit) => {
    return await postModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * @desc    Count the total number of documents matching a filter.
   * @param   {Object} filter – MongoDB query filter
   * @returns {Number} document count
   */
  countPosts: async (filter) => {
    return await postModel.countDocuments(filter);
  },

  // ─────────────────────────────────────────────
  //  UPDATE
  // ─────────────────────────────────────────────

  /**
   * @desc    Apply a partial update to a post document.
   * @param   {String} postId  – MongoDB ObjectId string
   * @param   {Object} updates – fields to update
   * @returns {Object} updated post document (returnDocument: 'after')
   */
  updatePost: async (postId, updates) => {
    return await postModel.findByIdAndUpdate(
      postId,
      { $set: updates },
      { returnDocument: "after" }
    );
  },

  // ─────────────────────────────────────────────
  //  DELETE
  // ─────────────────────────────────────────────

  /**
   * @desc    Permanently remove a post document from the database.
   * @param   {String} postId – MongoDB ObjectId string
   * @returns {Object} deletion result
   */
  deletePost: async (postId) => {
    return await postModel.findByIdAndDelete(postId);
  },
};

module.exports = postRepository;
