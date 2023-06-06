const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    userID: { type: mongoose.ObjectId, ref: 'User' },
    text: String,
    image: String,
    createdAt: { type: Date, default: new Date().toISOString() },
    likes: [{ type: mongoose.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: new Date().toISOString() }
    }]
})
const postModel = mongoose.model("Post", postSchema)

module.exports = {postModel};