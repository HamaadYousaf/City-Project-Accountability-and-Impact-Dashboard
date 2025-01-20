import { User } from "../models/user.model.js";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json({ data: users })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body)
        res.status(200).json({ data: user })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}