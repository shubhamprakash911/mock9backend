const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    dob: Date,
    bio: String,
    posts: [{ type: mongoose.ObjectId, ref: 'Post' }],
    friends: [{ type: mongoose.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.ObjectId, ref: 'User' }]
})

const userModel = mongoose.model("User", userSchema)

module.exports = {userModel};