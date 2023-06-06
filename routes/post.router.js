const { Authentication } = require("../middleware/authantication.middleware");
const { postModel } = require("../model/post.model");
const { userModel } = require("../model/user.model");

const postRouter = require("express").Router();


// get all posts
postRouter.get("/api/posts", async (req, res) => {
    try {
        let Posts = await postModel.find()
        res.status(200).send({ message: "Here are all the posts", Posts });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })
    }
});




// post a post
postRouter.post("/api/posts", Authentication, async (req, res) => {
    let post = req.body
    let authid = req.body.userID
    try {
        let Post = await new postModel(post).save()
        console.log(Post)
        let User = await userModel.findById({ _id: authid })
        User.posts.push(Post._id)
        await userModel.findByIdAndUpdate({ _id: authid }, User)
        res.status(201).send({ message: "New post created", Post, User: User._id });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })

    }
});


// update post
postRouter.patch("/api/posts/:id", Authentication, async (req, res) => {
    let authid = req.body.userID
    let postid = req.params.id
    try {
        let Post = await postModel.findById({ _id: postid })
        let owner = Post.userID
        if (owner != authid) {
            return res.status(401).send({ message: "cannot update Other people Posts" });
        } else {
            await postModel.findByIdAndUpdate({ _id: postid }, req.body)
            res.status(204).send({ message: "Post updated successfully"});
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })

    }
});


// delete a post
postRouter.delete("/api/posts/:id", Authentication, async (req, res) => {
    let authid = req.body.userID
    let postid = req.params.id

    try {
        let Post = await postModel.findById({ _id: postid })

        if (!Post) {
            return res.status(404).send({ message: "No post found with id: ",postid });
        }

        let ownerId = Post.userID
        if (ownerId != authid) {
            return res.status(401).send({ message: "cannot delete other people posts" });
        } else {
            let owner = await userModel.findById({ _id: authid })
            let ownerPosts = owner.posts
            ownerPosts = ownerPosts.filter((e) => e != postid)
            owner.posts = ownerPosts
            await userModel.findByIdAndUpdate({ _id: ownerId }, owner)
            let deleted = await postModel.findByIdAndDelete({ _id: postid })
            res.status(202).send({ message: `post with Id: ${postid} deleted successfully `, deleted });
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })

    }
});







// like  a post
postRouter.post("/api/posts/:id/like", Authentication, async (req, res) => {
    let postid = req.params.id
    let userID = req.body.userID
    try {
        let Post = await postModel.findById({ _id: postid })
        if (!Post) {
            return res.status(404).send({ message: "Post not found" });
        }
        Post.likes.push(userID)
        let currLike = await postModel.findByIdAndUpdate({ _id: postid }, Post)
        res.status(201).send({ message: "added a new like", currLike });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })

    }
});



//comment on a post
postRouter.post("/api/posts/:id/comment", Authentication, async (req, res) => {
    let postid = req.params.id
    let comment = req.body
    try {
        let Post = await postModel.findById({ _id: postid })
        Post.comments.push(comment)
        let NewComment = await postModel.findByIdAndUpdate({ _id: postid }, Post)
        res.status(201).send({ message: "a Commente added to the Post", NewComment });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })

    }
});



// get a post by id
postRouter.get("/api/posts/:id", async (req, res) => {
    let postid = req.params.id
    try {
        let Post = await postModel.findById({ _id: postid })
        res.status(200).send({ message: "Post by its Id", Post });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })

    }
});



module.exports = {postRouter};