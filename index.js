const express = require("express");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.router");
const { postRouter } = require("./routes/post.router");
require("dotenv").config()
const app = express();


app.use(express.json());

app.get("/", (req, res) => {
    res.send("backend")
})

app.use(userRouter)
app.use(postRouter)


app.listen(process.env.port, async () => {
    try {
        await connection
        console.log("connect to db")
    } catch (error) {
        res.send({ error })
        console.log(error)
    }
    console.log("server is running at port ", process.env.port)

})

