const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },

    caption: {
      type: String,
      minlength: [4, "min 4 character caption required"],
      maxlength: [100, "max allowed character is 100"],
      required: true,
    },

    postImageUrl: {
      type: String,
    },

    // track post edited or not
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const postModel = mongoose.model("post", postSchema);

module.exports = postModel;
