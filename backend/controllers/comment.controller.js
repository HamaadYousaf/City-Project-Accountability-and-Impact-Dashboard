import { Comment } from '../models/comment.model.js'

export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find()
        res.status(200).json({ data: comments })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const createComment = async (req, res) => {
    try {
        const comment = await Comment.create(req.body)
        res.status(200).json({ data: comment })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}