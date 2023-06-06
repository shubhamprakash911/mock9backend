const { userModel } = require("../model/user.model");
const bcrypt= require("bcrypt")
const jwt = require("jsonwebtoken");
const { Authentication } = require("../middleware/authantication.middleware");
const userRouter = require("express").Router();


//register user
userRouter.post("/api/register", async (req, res) => {
    try {
        let { email, password } = req.body
        let user = req.body
        const exist = await userModel.findOne({ email });
        if (exist) {
            res.status(200).send({ msg: "You have already registered" });
        } else {
            bcrypt.hash(password, 5, async (err, hash) => {
                if (hash) {
                    user.password = hash
                    let done = await new userModel(user).save()
                    res.status(201).send({ msg: "Registration successful", done });
                } else {
                    res.status(400).send({ msg: "Error from bcrypt"});
                }
            })
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })
    }
});


// user login
userRouter.post("/api/login", async (req, res) => {
    try {
        let { email, password } = req.body
        let Users = await userModel.find({ email })
        if (Users.length == 0) {
            res.status(200).send({ msg: "You have not registered" });
        } else {
            let user = Users[0]
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    jwt.sign({ userID: user._id }, process.env.key, (err, token) => {
                        if (token) {
                            res.status(200).send({ msg: "Login Successful", token, user });
                        } else {
                            res.status(400).send({ msg: "JWT error" });
                        }
                    });
                } else {
                    res.status(200).send({ msg: "Wrong credentials" });
                }

            })
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err })
    }
});

// get all users
userRouter.get("/api/users", async (req, res) => {
    try {
        const Users = await userModel.find();
        res.status(200).send({ msg: "Here are all the users", Users });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })
    }
});



// get all users friend by id
userRouter.get("/api/users/:id/friends", async (req, res) => {
    let id = req.params.id
    try {
        const User = await userModel.findById({ _id: id });
        let friends = User.friends
        res.status(201).send({ msg: `Here are ${User.name}'s friends `, friends });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })
    }
});



//send a friend request to another user by its userid
userRouter.post("/api/users/:id/friends", Authentication, async (req, res) => {
    let userId = req.params.id
    let myId = req.body.userID
    try {
        const User = await userModel.findById({ _id: userId });
        User.friendRequests.push(myId)
        await userModel.findByIdAndUpdate({ _id: userId }, User)
        // res.status(204).send({ msg: `sent a friend request to user with id: ${userId}`, User });
        res.status(204)
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })
    }
});

//reject or accept friend request
userRouter.patch("/api/users/:id/friends/:friendid", Authentication, async (req, res) => {
    let authid = req.body.userID
    let userid = req.params.id
    let friendid = req.params.friendid
    let accept = req.body.accept

    try {
        if (authid !== userid) {
            return res.status(400).send({ msg: "Cannot modify other's friends" })
        }
        const User = await userModel.findById({ _id: userid });
        let friendRequests = User.friendRequests;
        friendRequests = friendRequests.filter((e) => e != friendid)
        let friends = User.friends
        User.friendRequests = friendRequests
        if (friends.includes(friendid)) {
            return res.status(200).send({ msg: `The user with this friend id is already in your friends list` });
        }
        if (accept) {
            User.friends.push(friendid)
            await userModel.findByIdAndUpdate({ _id: userid }, User)
            res.status(204).send({ msg: `The user with id ${friendid} is now a friend of ${User.name}` });
        } else {
            await userModel.findByIdAndUpdate({ _id: userid }, User)
            res.status(204).send({ msg: `You have rejected the friend request of user with id : ${friendid}` });
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ Error: err.message })
    }
});


module.exports = {userRouter};