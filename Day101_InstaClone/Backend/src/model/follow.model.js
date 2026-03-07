const mongoose = require("mongoose");

const followSchema = mongoose.Schema(
  {
    follower: {
      type: String,
    },
    following: {
      type: String,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "active", "rejected", "blocked"],
        message: "Status must be one of: pending, active, rejected, blocked",
      },
      default: "pending",
    },
  },

  {
    timestamps: true,
  },
);

const followModel = mongoose.model("follow", followSchema);

module.exports = followModel;
