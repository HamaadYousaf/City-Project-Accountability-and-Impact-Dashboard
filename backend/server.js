import express from 'express';
import mongoose from 'mongoose'
import 'dotenv/config'
import { Project } from './models/project.model.js';

const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({ data: "hello" })
})

app.post("/api/projects", async (req, res) => {
    try {
        const project = await Project.create(req.body)
        res.status(200).json(project)
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
})

app.get("/api/projects", async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB successfully")

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}...`)
    })
}).catch((err) => console.log(err))
