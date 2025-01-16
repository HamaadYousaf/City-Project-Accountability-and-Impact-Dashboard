import express from 'express';
import mongoose from 'mongoose'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({ data: "hello" })
})

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB successfully")

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}...`)
    })
}).catch((err) => console.log(err))
