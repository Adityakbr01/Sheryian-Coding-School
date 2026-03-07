const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/user.service");
const ApiResponse = require("../utils/apiResponse");
const STATUS_CODES = require("../constants/statusCodes");

/**
 * =========================================
 * USER CONTROLLER
 * =========================================
 * @description Thin layer between HTTP and the service layer.
 *              Extracts request data, delegates to postService,
 *              and sends a standardised API response.
 * @module controllers/user.controller
 */

const userController = {
  /**
   * ------------------------------------------------
   * @route   POST /api/v1/user/follow/:userName
   * @desc    Follow a user by their userName
   * @access  Authenticated
   * ------------------------------------------------
   */
  followUser: asyncHandler(async (req, res) => {
    const targetUserName = req.params.userName;
    const currentUserName = req.user.userName;

    const followRecord = await userService.followUser({
      currentUserName,
      targetUserName,
    });

    ApiResponse.success(res, {
      status: STATUS_CODES.CREATED,
      message: followRecord.message,
      data: followRecord.data,
    });
  }),

  /**
   * ------------------------------------------------
   * @route   DELETE /api/v1/user/unfollow/:userName
   * @desc    Unfollow a user by their userName
   * @access  Authenticated
   * ------------------------------------------------
   */
  unfollowUser: asyncHandler(async (req, res) => {
    const targetUserName = req.params.userName;
    const currentUserName = req.user.userName;

    const result = await userService.unfollowUser({
      currentUserName,
      targetUserName,
    });

    ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
    });
  }),

  /**
   * ------------------------------------------------
   * @route   PUT /api/v1/user/follow-request/:followerName
   * @desc    Respond to a follow request (active, rejected, blocked)
   * @access  Authenticated
   * ------------------------------------------------
   */
  updateFollowStatus: asyncHandler(async (req, res) => {
    const followerName = req.params.followerName;
    const followingName = req.user.userName; // The person being followed is the logged-in user
    const { status } = req.body;

    const result = await userService.updateFollowStatus({
      followerName,
      followingName,
      status,
    });

    ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
      data: result.data,
    });
  }),

  /**
   * ------------------------------------------------
   * @route   GET /api/v1/user/follow-requests
   * @desc    Get all pending follow requests for the logged-in user
   * @access  Authenticated
   * ------------------------------------------------
   */
  getPendingFollowRequests: asyncHandler(async (req, res) => {
    const userName = req.user.userName;

    const result = await userService.getPendingFollowRequests(userName);

    ApiResponse.success(res, {
      status: STATUS_CODES.OK,
      message: result.message,
      data: result.data,
    });
  }),
};

module.exports = userController;
