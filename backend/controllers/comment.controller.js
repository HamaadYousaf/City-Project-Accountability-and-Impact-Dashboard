import { Comment } from '../models/comment.model.js'

export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find()
        res.status(200).json({ data: comments })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const getCommentsByProject = async (req, res) => {
    try {
        const { projectId } = req.params
        const comments = await Comment.find({ projectId })
        res.status(200).json({ data: comments })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const getCommentsByReport = async (req, res) => {
    try {
        const { reportId } = req.params
        const comments = await Comment.find({ reportId })
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

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params
        const comment = await Comment.findByIdAndUpdate(id, req.body, { new: true })
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' })
        }
        res.status(200).json({ data: comment })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params
        const comment = await Comment.findByIdAndDelete(id)
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' })
        }
        res.status(200).json({ msg: 'Comment deleted successfully' })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const deleteUserComments = async (req, res) => {
    try {
        const userId = req.params.userId;
        await Comment.deleteMany({ user: userId });
        res.status(200).json({ msg: 'All user comments deleted successfully' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
