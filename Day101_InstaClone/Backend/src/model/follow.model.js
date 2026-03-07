const mongoose = require("mongoose");

const followSchema = mongoose.Schema({
  follower: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: [true, "Followers required"],
  },
  following: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: [true, "Following required"],
  },
},{
    timestaps:true
});


const followModel = mongoose.model("follow",followSchema)

module.exports = followModel