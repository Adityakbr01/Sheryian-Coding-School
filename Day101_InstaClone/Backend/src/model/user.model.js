const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const randomDefaultImages = [
  "https://static.vecteezy.com/system/resources/thumbnails/009/354/852/small/male-portrait-people-profile-perfect-for-social-media-and-business-presentations-user-interface-ux-graphic-and-web-design-applications-and-interfaces-illustration-vector.jpg",

  "https://static.vecteezy.com/system/resources/thumbnails/014/528/970/small/man-avatar-icon-flat-vector.jpg",

  "https://static.vecteezy.com/system/resources/thumbnails/002/002/263/small/black-man-with-beard-avatar-character-free-vector.jpg",

  "https://static.vecteezy.com/system/resources/thumbnails/025/869/631/small/profile-image-of-man-avatar-for-social-networks-with-half-circle-fashion-bright-illustration-in-trendy-style-free-vector.jpg",
];

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      maxlength: [30, "Username cannot exceed 30 characters"],
      minlength: [3, "Username must be at least 3 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    profileImage: {
      type: String,
      default: function () {
        const randomIndex = Math.floor(
          Math.random() * randomDefaultImages.length,
        );
        return randomDefaultImages[randomIndex];
      },
    },

    bio: {
      type: String,
      maxlength: [150, "Bio cannot exceed 150 characters"],
      default: "",
    },


    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    ],

    isPrivate: {
      type: Boolean,
      default: false,
    },

    blockUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true },
);

/**
 * @user.model
 * @desc   Hash the user password before saving
 * @access Public
 */

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

/**
 * @user.model
 * @desc   Compare user password with hashed password
 * @access Public
 */

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
