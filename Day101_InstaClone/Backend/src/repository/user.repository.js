const Follow = require("../model/follow.model");
const userModel = require("../model/user.model");

const userRepository = {
  /**
   * Find existing follow record
   */

  findFollowRecord: async (follower, following) => {
    return await Follow.findOne({
      follower,
      following,
    });
  },

  /**
   * Create follow record
   */

  createFollowRecord: async (data) => {
    return await Follow.create(data);
  },

  /**
   * Delete follow record
   */

  deleteFollowRecord: async (data) => {
    return await Follow.deleteOne(data);
  },

  /**
   * Update follow status
   */
  updateFollowStatus: async (follower, following, status) => {
    return await Follow.findOneAndUpdate(
      { follower, following },
      { status },
      { new: true }
    );
  },

  /**
   * Get all pending follow requests for a user
   */
  getPendingFollowRequests: async (following) => {
    return await Follow.find({ following, status: "pending" });
  },

  /**
   * find a user
   */

  findUserByUserName: async (userName) => {
    return await userModel.findOne({ userName });
  },
};

module.exports = userRepository;
