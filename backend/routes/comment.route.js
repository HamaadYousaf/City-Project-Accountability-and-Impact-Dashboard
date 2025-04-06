import express from 'express'
import { createComment, getComments, getCommentsByProject, getCommentsByReport, updateComment, deleteComment, deleteUserComments } from '../controllers/comment.controller.js';
const router = express.Router();

router.route('/').get(getComments).post(createComment)
router.route('/project/:projectId').get(getCommentsByProject)
router.route('/report/:reportId').get(getCommentsByReport)
router.route('/:id').put(updateComment).delete(deleteComment)
router.route('/user/:userId').delete(deleteUserComments);

export default router