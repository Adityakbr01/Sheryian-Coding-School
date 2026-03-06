const cookieConf = require("../configs/cookieConf");
const STATUS_CODES = require("../constants/statusCodes");
const authService = require("../services/auth.service");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * =========================================
 * AUTH CONTROLLER
 * =========================================
 * @description Handles user authentication logic
 *              such as user registration and login.
 * @module controllers/authController
 */

const authController = {
  /**
   * ------------------------------------------------
   * @route   POST /api/v1/auth/register
   * @desc    Register a new user account
   * @access  Public
   *
   * @body
   *  - userName {String} Required
   *  - email    {String} Required
   *  - password {String} Required
   *
   * @returns
   *  - 201 : User created successfully
   *  - 400 : Validation error
   *  - 409 : Email already exists
   */
  registerUser: asyncHandler(async (req, res) => {
    const createdUser = await authService.registerUser(req.body);

    // Store JWT in cookie
    res.cookie("token", createdUser.token, cookieConf);

    return ApiResponse.success(res, {
      status: STATUS_CODES.CREATED,
      message: createdUser.message,
      data: {
        user: createdUser.user,
        token: createdUser.token,
      },
    });
  }),

  /**
   * ------------------------------------------------
   * @route   POST /api/v1/auth/login
   * @desc    Authenticate user and return access token
   * @access  Public
   *
   * @body
   *  - email OR userName {String} Required
   *  - password {String} Required
   *
   * @returns
   *  - 200 : Login successful
   *  - 401 : Invalid credentials
   *  - 404 : User not found
   */
  loginUser: asyncHandler(async (req, res) => {
    const loggedInUser = await authService.loginUser(req.body);

    // Store JWT in cookie
    res.cookie("token", loggedInUser.token, cookieConf);

    return ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: loggedInUser.message,
      data: loggedInUser,
    });
  }),
};

module.exports = authController;