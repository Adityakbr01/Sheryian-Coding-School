const { default: mongoose } = require("mongoose");

const likeSchema = mongoose.Schema(
  {
    post: {
      type: mongoose.Types.ObjectId,
      ref: "post",
      required: [true, "post id is required to like a post"],
    },
    likedBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "user id is required to like a post"],
    },
  },
  {
    timestamps: true,
  },
);

likeSchema.index({ post: 1, likedBy: 1 }, { unique: true });

const likeModel = mongoose.model("like", likeSchema);

module.exports = likeModel;