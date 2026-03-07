const userRepository = require("../repository/user.repository");
const ApiError = require("../utils/apiError");
const STATUS_CODES = require("../constants/statusCodes");

/**
 * =========================================
 * USER SERVICE
 * =========================================
 * @description Business logic layer for user-related operations.
 *              Validates rules, interacts with the repository,
 *              and returns structured results to the controller.
 * @module services/user.service
 */
const userService = {
  /**
   * ------------------------------------------------
   * @function followUser
   * @desc     Follow a user by their username
   * ------------------------------------------------
   * @param {Object} params
   * @param {string} params.currentUserName - The logged-in user's username
   * @param {string} params.targetUserName  - The username to follow
   * @returns {{ data: FollowRecord, message: string }}
   * @throws {ApiError} 400 if self-follow attempted
   * @throws {ApiError} 409 if follow relationship already exists
   */
  followUser: async ({ currentUserName, targetUserName }) => {
    if (currentUserName === targetUserName) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "You cannot follow yourself",
      );
    }

    const isUserExist = await userRepository.findUserByUserName(targetUserName)

    if(!isUserExist){
        throw new ApiError(
            STATUS_CODES.NOT_FOUND,
            `User @${targetUserName} does not exist`
        )
    }

    const existingFollow = await userRepository.findFollowRecord(
      currentUserName,
      targetUserName,
    );

    if (existingFollow) {
      if (existingFollow.status === "blocked") {
        throw new ApiError(
          STATUS_CODES.FORBIDDEN,
          `You cannot follow @${targetUserName}`,
        );
      }

      if (existingFollow.status === "pending") {
        throw new ApiError(
          STATUS_CODES.CONFLICT,
          `Follow request to @${targetUserName} is already pending`,
        );
      }

      if (existingFollow.status === "active") {
        throw new ApiError(
          STATUS_CODES.CONFLICT,
          `You are already following @${targetUserName}`,
        );
      }

      // If the request was previously rejected, they can try following again
      // We just update the existing record back to "pending"
      if (existingFollow.status === "rejected") {
        const record = await userRepository.updateFollowStatus(
          currentUserName,
          targetUserName,
          "pending"
        );
        return {
          data: record,
          message: `Follow request sent to @${targetUserName} (pending by default)`,
        };
      }
    }

    const record = await userRepository.createFollowRecord({
      follower: currentUserName,
      following: targetUserName,
    });

    return {
      data: record,
      message: `Follow request sent to @${targetUserName} (pending by default)`,
    };
  },

  /**
   * ------------------------------------------------
   * @function unfollowUser
   * @desc     Unfollow a user by their username
   * ------------------------------------------------
   *
   * Business Rules:
   * 1. A user cannot unfollow themselves (400 Bad Request)
   * 2. Target user must exist (404 Not Found)
   * 3. A follow record must already exist to unfollow (404 Not Found)
   * 4. Deletes the follow record and returns a confirmation message
   *
   * @param {Object} params
   * @param {string} params.currentUserName - The logged-in user's username
   * @param {string} params.targetUserName  - The username to unfollow
   * @returns {{ message: string }}
   * @throws {ApiError} 400 if self-unfollow attempted
   * @throws {ApiError} 404 if target user does not exist
   * @throws {ApiError} 404 if follow record does not exist
   */
  unfollowUser: async ({ currentUserName, targetUserName }) => {

    if (currentUserName === targetUserName) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "You cannot unfollow yourself",
      );
    }

    const isUserExist = await userRepository.findUserByUserName(targetUserName);
    if (!isUserExist) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        `User @${targetUserName} does not exist`,
      );
    }

    const existingFollow = await userRepository.findFollowRecord(
      currentUserName,
      targetUserName,
    );
    if (!existingFollow) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        `You are not following @${targetUserName}`,
      );
    }

    await userRepository.deleteFollowRecord({
      follower: currentUserName,
      following: targetUserName,
    });

    return {
      message: `@${currentUserName} unfollowed @${targetUserName}`,
    };
  },

  /**
   * ------------------------------------------------
   * @function updateFollowStatus
   * @desc     Accept, reject, or block a follow request
   * ------------------------------------------------
   *
   * Business Rules:
   * 1. Target target user must exist (404 Not Found)
   * 2. Follow record must exist (404 Not Found)
   * 3. Valid status must be provided
   *
   * @param {Object} params
   * @param {string} params.followerName  - The user who sent the follow request
   * @param {string} params.followingName - The logged-in user evaluating the request
   * @param {string} params.status        - "active", "rejected", or "blocked"
   * @returns {{ data: FollowRecord, message: string }}
   */
  updateFollowStatus: async ({ followerName, followingName, status }) => {
    const validStatuses = ["active", "rejected", "blocked"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const isFollowerExist = await userRepository.findUserByUserName(followerName);
    if (!isFollowerExist) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        `User @${followerName} does not exist`,
      );
    }

    const existingFollow = await userRepository.findFollowRecord(
      followerName,
      followingName,
    );

    if (!existingFollow) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        `No follow request found from @${followerName}`,
      );
    }

    const updatedRecord = await userRepository.updateFollowStatus(
      followerName,
      followingName,
      status,
    );

    let actionMessage = "";
    if (status === "active") actionMessage = "accepted";
    if (status === "rejected") actionMessage = "rejected";
    if (status === "blocked") actionMessage = "blocked";

    return {
      data: updatedRecord,
      message: `You ${actionMessage} follow request from @${followerName}`,
    };
  },

  /**
   * ------------------------------------------------
   * @function getPendingFollowRequests
   * @desc     Get all pending follow requests for the logged-in user
   * ------------------------------------------------
   *
   * @param {string} userName - The logged-in user's username
   * @returns {{ data: Array, message: string }}
   */
  getPendingFollowRequests: async (userName) => {
    const requests = await userRepository.getPendingFollowRequests(userName);

    return {
      data: requests,
      message: `Fetched ${requests.length} pending follow requests`,
    };
  },
};

module.exports = userService;
