const userModel = require("../model/user.model");

/**
 * =========================================
 * AUTH REPOSITORY
 * =========================================
 * @description Handles all database operations
 *              related to the User authentication.
 *              This layer directly communicates
 *              with the database (MongoDB).
 */

const authRepository = {
  /**
   * ------------------------------------------------
   * @function createUser
   * @desc    Create a new user in the database
   * @access  Internal
   * @param   {Object} data - user data
   * @returns {Object} created user document
   */
  createUser: async (data) => {
    return await userModel.create(data);
  },

  /**
   * ------------------------------------------------
   * @function updateUser
   * @desc    Update user information
   * @access  Internal
   * @param   {Object} params - filter params (ex: { _id })
   * @param   {Object} data - updated data
   * @returns {Object} updated user
   */
  updateUser: async (params, data) => {
    return await userModel.findOneAndUpdate(params, data, {
      new: true,
    });
  },

  /**
   * ------------------------------------------------
   * @function findUser
   * @desc    Find a single user by given parameters
   * @access  Internal
   * @param   {Object} params - query object
   * @returns {Object|null} user document
   */
  findUser: async (params) => {
    return await userModel.findOne(params);
  },

  /**
   * ------------------------------------------------
   * @function findUserById
   * @desc    Find user by ID
   * @access  Internal
   * @param   {String} userId
   * @returns {Object|null}
   */
  findUserById: async (userId) => {
    return await userModel.findById(userId);
  },

  /**
   * ------------------------------------------------
   * @function isUserAlready
   * @desc    Check if user already exists
   *          based on username or email
   * @access  Internal
   * @param   {Object} params
   * @returns {Object|null}
   */
  isUserAlready: async ({ userName, email }) => {
    return await userModel.findOne({
      $or: [{ userName }, { email }],
    });
  },

  /**
   * ------------------------------------------------
   * @function deleteUser
   * @desc    Delete user by ID
   * @access  Internal
   * @param   {String} userId
   * @returns {Object}
   */
  deleteUser: async (userId) => {
    return await userModel.findByIdAndDelete(userId);
  },

  /**
   * ------------------------------------------------
   * @function findUserWithPassword
   * @desc    Find user including password field
   *          (password is hidden by default in schema)
   * @access  Internal
   * @param   {Object} params - query parameters (ex: { email } or { userName })
   * @returns {Object|null} user document with password
   */
  findUserWithPassword: async (params) => {
    return await userModel
      .findOne({
        $or: [{ email: params.email }, { userName: params.userName }],
      })
      .select("+password");
  },
};

module.exports = authRepository;
