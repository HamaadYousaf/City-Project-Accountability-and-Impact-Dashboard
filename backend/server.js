import express from 'express';
import mongoose from 'mongoose'
import 'dotenv/config'
import projectRoutes from './routes/project.route.js'
import userRoutes from './routes/user.route.js'
import reportRoutes from './routes/report.route.js'
import commentRoutes from './routes/comment.route.js'

const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({ data: "hello" })
})

app.use("/api/projects", projectRoutes)
app.use("/api/users", userRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/comments", commentRoutes)

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB successfully")

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}...`)
    })
}).catch((err) => console.log(err))
