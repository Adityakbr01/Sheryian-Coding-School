const express = require("express");
const userController = require("../controllers/user.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();
/**
 * @route   POST /api/v1/user/follow/:userName
 * @desc    Follow a user by userName
 * @access  AUTHENTICATED
 * @param   {string} userName - userName of the user to follow
 */
router.post("/follow/:userName", isAuthenticated, userController.followUser);

/**
 * @route   DELETE /api/v1/user/unfollow/:userName
 * @desc    Unfollow a user by userName
 * @access  AUTHENTICATED
 * @param   {string} userName - userName of the user to unfollow
 */
router.delete(
  "/unfollow/:userName",
  isAuthenticated,
  userController.unfollowUser,
);

/**
 * @route   PUT /api/v1/user/follow-request/:followerName
 * @desc    Accept, reject, or block a follow request
 * @access  AUTHENTICATED
 * @param   {string} followerName - userName of the follower
 * @body    {string} status - "active", "rejected", or "blocked"
 */
router.put(
  "/follow-request/:followerName",
  isAuthenticated,
  userController.updateFollowStatus,
);

/**
 * @route   GET /api/v1/user/follow-requests
 * @desc    Get all pending follow requests for the logged-in user
 * @access  AUTHENTICATED
 */
router.get(
  "/follow-requests",
  isAuthenticated,
  userController.getPendingFollowRequests,
);

module.exports = router;
